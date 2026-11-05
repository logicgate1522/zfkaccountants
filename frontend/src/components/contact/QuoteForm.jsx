"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaLock } from "react-icons/fa";

import { useCms } from "@/components/cms/useCms";
import { saveBookingRef } from "@/components/contact/bookingHandoff";
import { submitForm } from "@/lib/forms";
import quoteFormDefinition from "@/data/quote-form.json";

/* =========================================
   Booking form (free consultation; stored as the "quote" form)
   Definition: home/form-quote/ (admin-editable,
   no code change to add/remove a field).
   Submit:     POST forms/quote/submit/
   The server validates against the same
   definition; its {errors} are authoritative.
   Success:    the visitor goes to /thank-you.
========================================= */

export const THANK_YOU_PATH = "/thank-you";

export const FORM_NAME = "quote";

// Built-in definition; also what `npm run cms:seed` stores in the CMS.
export const DEFAULT_QUOTE_FORM = quoteFormDefinition;

const FIELD_HINTS = {
    "fields[].type": {
        type: "select",
        options: ["text", "textarea", "email", "tel", "url", "number", "date", "time", "datetime", "select", "multiselect", "radio", "checkbox", "checkboxes", "consent_marketing", "file", "hidden", "rating", "range"],
    },
    "fields[].width": { type: "select", options: ["half", "full"] },
    "fields[].name": { label: "Field key (letters, numbers, _)" },
    "fields[].options": { label: "Options (select / radio / checkboxes)" },
    honeypotField: { label: "Honeypot field name (spam trap)" },
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function emptyValue(field) {
    if (field.type === "checkbox" || field.type === "consent_marketing") return false;
    if (field.type === "multiselect" || field.type === "checkboxes") return [];
    return field.default ?? "";
}

function optionList(field) {
    return (field.options || []).map((opt) =>
        typeof opt === "object" ? { value: String(opt.value ?? opt.label), label: String(opt.label ?? opt.value) } : { value: String(opt), label: String(opt) }
    );
}

function clientErrors(definition, values) {
    const errors = {};
    for (const field of definition.fields || []) {
        // Marketing opt-in is never required and never pre-ticked (R33).
        if (field.type === "hidden" || field.type === "consent_marketing") continue;
        const value = values[field.name];
        const present = Array.isArray(value) ? value.length > 0 : value !== "" && value !== false && value !== undefined && value !== null;
        if (field.required && !present) {
            errors[field.name] = `${field.label || field.name} is required.`;
        } else if (present && field.type === "email" && !EMAIL.test(String(value))) {
            errors[field.name] = `${field.label || field.name} must be a valid email address.`;
        }
    }
    if (definition.consent?.required && !values.consent) {
        errors.consent = definition.consent.text || "Consent is required.";
    }
    return errors;
}

const STYLES = {
    desktop: {
        stepFirst: "mt-4",
        grid: "mt-3 grid grid-cols-2 gap-x-3 gap-y-3",
        input: "h-10 w-full rounded-xl border border-[#DCE6F2] bg-white px-4 text-sm text-[#123A5C] outline-none transition placeholder:text-[#94A3B8] hover:border-[#B8C7DA] focus:border-[#0F9E86] focus:ring-2 focus:ring-[#0F9E86]/20",
        textarea: "h-14 w-full resize-none rounded-xl border border-[#DCE6F2] bg-white px-4 py-3 text-sm text-[#123A5C] outline-none transition placeholder:text-[#94A3B8] hover:border-[#B8C7DA] focus:border-[#0F9E86] focus:ring-2 focus:ring-[#0F9E86]/20",
        textareaWrap: "mt-4",
        button: "mt-4 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#FF6B4A] text-base font-semibold text-white shadow-[0_10px_24px_rgba(255,107,74,0.28)] transition hover:-translate-y-px hover:opacity-95 active:translate-y-0 disabled:cursor-wait disabled:opacity-60",
        arrow: "",
        note: "mt-2.5 flex items-center justify-center gap-2 text-xs text-[#64748B]",
        half: "",
        full: "col-span-2",
    },
    mobile: {
        stepFirst: "mt-4",
        grid: "mt-3 grid grid-cols-2 gap-x-2.5 gap-y-3",
        input: "h-11 w-full rounded-xl border border-[#DCE6F2] bg-white px-3 text-base text-[#123A5C] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F9E86] focus:ring-2 focus:ring-[#0F9E86]/20 sm:text-sm",
        textarea: "h-16 w-full resize-none rounded-xl border border-[#DCE6F2] bg-white px-4 py-3 text-base text-[#123A5C] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F9E86] focus:ring-2 focus:ring-[#0F9E86]/20 sm:text-sm",
        textareaWrap: "mt-4",
        button: "mt-4 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#FF6B4A] text-base font-semibold text-white shadow-[0_10px_24px_rgba(255,107,74,0.28)] transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-60",
        arrow: "text-base sm:text-lg",
        note: "mt-3 flex items-center justify-center gap-2 text-center text-[11px] leading-4 text-[#64748B] sm:text-xs",
        half: "",
        full: "col-span-2",
    },
};

const LABEL = "mb-1 block text-[13px] font-semibold text-[#123A5C]";
// Options are pill buttons: the whole pill is the hit area, not a 13px box.
const CHIP =
    "inline-flex min-h-10 cursor-pointer select-none items-center justify-center gap-2 rounded-xl border border-[#DCE6F2] bg-white px-3.5 py-1.5 text-sm font-medium text-[#123A5C] transition hover:border-[#0F9E86] hover:bg-[#F2FBF9] has-[:checked]:border-[#0F9E86] has-[:checked]:bg-[#E8F7F4] has-[:checked]:text-[#0B6B5B] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#0F9E86]/40";
// A select with this many options or fewer shows them all as one-click pills;
// longer lists stay a compact dropdown.
const MAX_CHIPS = 4;
// Quick-pick working days offered for a date field.
const QUICK_DAYS = 6;

const AUTOCOMPLETE = { name: "name", full_name: "name", email: "email", phone: "tel", tel: "tel", company: "organization", business_name: "organization" };

function localDate(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// The next few working days (from tomorrow), as one-click choices.
function upcomingWorkdays(count) {
    const days = [];
    const day = new Date();
    while (days.length < count) {
        day.setDate(day.getDate() + 1);
        if (day.getDay() === 0 || day.getDay() === 6) continue;
        days.push({
            value: localDate(day),
            weekday: day.toLocaleDateString("en-GB", { weekday: "short" }),
            date: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        });
    }
    return days;
}

// Placeholder text only when it says more than the visible label does.
function hintFor(field) {
    const clean = (s) => String(s || "").replace(/\*/g, "").trim().toLowerCase();
    return field.placeholder && clean(field.placeholder) !== clean(field.label) ? field.placeholder : "";
}

// The form reads as three short steps. A field can name its step with
// `group`; otherwise its type decides. Headings are definition.groups.*.
const GROUP_ORDER = ["details", "needs", "time"];
function groupOf(field) {
    if (GROUP_ORDER.includes(field.group)) return field.group;
    if (field.type === "checkboxes" || field.type === "multiselect") return "needs";
    if (["date", "time", "datetime", "radio"].includes(field.type) || /(^|_)(date|time|meet)/.test(field.name)) return "time";
    return "details";
}

// Controls that always take a whole row.
function isWide(field) {
    return field.width === "full" || ["textarea", "checkboxes", "multiselect", "radio", "date"].includes(field.type);
}

function DateField({ common, field, value, onChange, onBlur, className }) {
    const [days, setDays] = useState([]);
    // Built after mount so the server and browser never disagree on "today".
    useEffect(() => setDays(upcomingWorkdays(QUICK_DAYS)), []);
    const quick = days.some((d) => d.value === value);
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {days.map((d, index) => (
                    <label key={index} className={`${CHIP} flex-col gap-0 px-2 py-1.5 leading-tight`}>
                        <input type="radio" name={`${field.name}-quick`} value={d.value} checked={value === d.value} onChange={() => onChange(d.value)} className="sr-only" />
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{d.weekday}</span>
                        <span>{d.date}</span>
                    </label>
                ))}
            </div>
            <input
                {...common}
                type="date"
                min={localDate(new Date())}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                // Clicking anywhere in the box opens the calendar, not just the icon.
                onClick={(e) => e.currentTarget.showPicker?.()}
                className={`${className} cursor-pointer ${quick ? "text-[#94A3B8]" : ""}`}
            />
        </div>
    );
}

function Field({ field, index, E, value, error, onChange, onBlur, styles, idPrefix, span }) {
    const id = `${idPrefix}-${field.name}`;
    const errorId = error ? `${id}-error` : undefined;
    const invalid = error ? "border-[#E5484D] focus:border-[#E5484D] focus:ring-[#E5484D]/20" : "";
    const base = `fields.${index}`;
    const common = {
        id,
        name: field.name,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": errorId,
        "aria-required": field.required || undefined,
    };
    const placeholder = hintFor(field);
    const options = optionList(field);
    // Option text is edited in place; object options keep their label.
    const optionPath = (i) => (typeof field.options[i] === "object" ? `${base}.options.${i}.label` : `${base}.options.${i}`);
    const label = (
        <>
            <E.Text path={`${base}.label`} />
            {field.required ? <span className="text-[#FF6B4A]">{" *"}</span> : null}
        </>
    );
    const chips = (type, isChecked, toggle) => (
        <fieldset aria-describedby={errorId} aria-invalid={error ? true : undefined}>
            <legend className={LABEL}>{label}</legend>
            {/* Tick-boxes sit in two even columns, so a long list stays short. */}
            <div className={type === "checkbox" ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2"}>
                {options.map((o, i) => (
                    <label key={i} className={`${CHIP} ${type === "checkbox" ? "justify-start px-3 text-left text-[13px] leading-snug sm:text-sm" : ""} ${error ? "border-[#F4B4B4]" : ""}`}>
                        <input type={type} name={field.name} value={o.value} checked={isChecked(o.value)} onChange={() => toggle(o.value)} onBlur={onBlur} className="sr-only" />
                        {type === "checkbox" ? (
                            <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-current text-[10px] leading-none">
                                {isChecked(o.value) ? "✓" : ""}
                            </span>
                        ) : null}
                        <E.Text path={optionPath(i)} />
                    </label>
                ))}
            </div>
        </fieldset>
    );

    let control;
    let labelled = true;
    switch (field.type) {
        case "textarea":
            control = <textarea {...common} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} className={`${styles.textarea} ${invalid}`} />;
            break;
        case "select":
            if (options.length && options.length <= MAX_CHIPS) {
                labelled = false;
                control = chips("radio", (v) => value === v, (v) => onChange(v));
                break;
            }
            control = (
                <select {...common} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} className={`${styles.input} cursor-pointer ${invalid} ${value ? "" : "text-[#94A3B8]"}`}>
                    <option value="">{placeholder || field.label}</option>
                    {options.map((o, i) => <option key={i} value={o.value}>{o.label}</option>)}
                </select>
            );
            break;
        case "multiselect":
        case "checkboxes":
            labelled = false;
            control = chips("checkbox", (v) => value.includes(v), (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]));
            break;
        case "radio":
            labelled = false;
            control = chips("radio", (v) => value === v, (v) => onChange(v));
            break;
        case "consent_marketing":
        case "checkbox":
            labelled = false;
            control = (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl px-1 py-0.5 text-sm text-[#475569]">
                    <input
                        {...common}
                        type="checkbox"
                        checked={field.type === "consent_marketing" ? value === true : !!value}
                        data-cms-field={field.type === "consent_marketing" ? "consent_marketing" : undefined}
                        onChange={(e) => onChange(e.target.checked)}
                        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#0F9E86]"
                    />
                    <span>{label}</span>
                </label>
            );
            break;
        case "rating":
            control = (
                <div className="flex items-center gap-1" role="radiogroup" aria-labelledby={`${id}-label`}>
                    {[1, 2, 3, 4, 5].map((n, i) => (
                        <button key={i} type="button" role="radio" aria-checked={Number(value) === n} onClick={() => onChange(n)} className={`h-11 w-11 text-2xl ${Number(value) >= n ? "text-[#FF6B4A]" : "text-[#CBD5E1]"}`}>
                            ★
                        </button>
                    ))}
                </div>
            );
            break;
        case "range": {
            const v = field.validation || {};
            control = (
                <div className="flex items-center gap-3 text-sm text-[#475569]">
                    <input {...common} type="range" min={v.min ?? 0} max={v.max ?? 100} step={v.step ?? 1} value={value || v.min || 0} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#0F9E86]" />
                    <strong>{value || v.min || 0}</strong>
                </div>
            );
            break;
        }
        case "file":
            control = (
                <input {...common} type="file" onChange={(e) => onChange(e.target.files?.[0]?.name || "")} className={`${styles.input} cursor-pointer py-2 file:mr-3 file:rounded-md file:border-0 file:bg-[#E2E8F0] file:px-3 file:py-1`} />
            );
            break;
        case "hidden":
            return <input type="hidden" name={field.name} value={value} />;
        case "date":
            control = <DateField common={common} field={field} value={value} onChange={onChange} onBlur={onBlur} className={`${styles.input} ${invalid}`} />;
            break;
        case "time":
        case "datetime":
            control = (
                <input
                    {...common}
                    type={field.type === "datetime" ? "datetime-local" : "time"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className={`${styles.input} cursor-pointer ${invalid}`}
                />
            );
            break;
        default: {
            const type = field.type || "text";
            control = (
                <input
                    {...common}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    autoComplete={AUTOCOMPLETE[field.name] || { email: "email", tel: "tel", url: "url" }[type]}
                    inputMode={{ email: "email", tel: "tel", number: "numeric", url: "url" }[type]}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    className={`${styles.input} ${invalid}`}
                />
            );
        }
    }

    const wide = span || isWide(field) || !labelled;
    return (
        <div className={wide ? styles.full : styles.half} data-field={field.name}>
            {labelled ? <label id={`${id}-label`} htmlFor={id} className={LABEL}>{label}</label> : null}
            {control}
            {field.help ? <p className="mt-1 text-[11px] text-[#64748B]"><E.Text path={`${base}.help`} /></p> : null}
            {error ? <p id={errorId} role="alert" className="mt-1.5 text-[12px] font-medium text-[#D92D20]">{error}</p> : null}
        </div>
    );
}

export default function QuoteForm({ variant = "desktop" }) {
    const { data: definition, E, editButton, hidden } = useCms(`form-${FORM_NAME}`, DEFAULT_QUOTE_FORM, {
        label: "Booking form",
        excludeFromKeywordAudit: true,
        fields: FIELD_HINTS,
    });
    const styles = STYLES[variant];
    const fields = definition.fields || [];
    const honeypot = definition.honeypotField || "website";
    const formRef = useRef(null);
    const router = useRouter();

    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [status, setStatus] = useState({ state: "idle", message: "" });

    const valueOf = (field) => values[field.name] ?? emptyValue(field);
    const currentValues = (overrides = {}) => {
        const all = {};
        for (const field of fields) all[field.name] = valueOf(field);
        return { ...all, consent: values.consent, ...overrides };
    };
    // Once a field has been left (or a submit tried), it re-checks as you
    // type, so an error clears the moment it is fixed.
    const setValue = (name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: touched[name] ? clientErrors(definition, currentValues({ [name]: value }))[name] : undefined }));
    };
    const blurField = (name) => {
        setTouched((prev) => ({ ...prev, [name]: true }));
        setErrors((prev) => ({ ...prev, [name]: clientErrors(definition, currentValues())[name] }));
    };

    // Take the visitor straight to the first field that needs attention.
    const showFirstError = (found) => {
        const first = fields.find((f) => found[f.name]);
        if (!first) return;
        const box = formRef.current?.querySelector(`[data-field="${first.name}"]`);
        box?.scrollIntoView({ behavior: "smooth", block: "center" });
        box?.querySelector("input:not([type=hidden]), select, textarea")?.focus({ preventScroll: true });
    };

    async function onSubmit(event) {
        event.preventDefault();
        if (status.state === "sending" || status.state === "done") return;

        const payload = {};
        for (const field of fields) payload[field.name] = valueOf(field);
        if (definition.consent?.required || values.consent) payload.consent = !!values.consent;
        payload[honeypot] = new FormData(event.currentTarget).get(honeypot) || "";

        const found = clientErrors(definition, payload);
        if (Object.keys(found).length) {
            setErrors(found);
            setTouched(Object.fromEntries(fields.map((f) => [f.name, true])));
            setStatus({ state: "error", message: definition.errorMessage });
            showFirstError(found);
            return;
        }

        setStatus({ state: "sending", message: "" });
        // Stores the lead in the CMS, then emails it (FormSubmit) and fires
        // the generate_lead event — see lib/forms.js.
        const result = await submitForm(FORM_NAME, payload, { honeypotField: honeypot });
        if (!result.ok) {
            setErrors(result.errors || {});
            showFirstError(result.errors || {});
            const message = result.status === 429
                ? "Too many requests — please wait a minute and try again."
                : result.status === 0
                    ? "We couldn't send your request. Please try again shortly."
                    : definition.errorMessage;
            setStatus({ state: "error", message });
            return;
        }
        // Stored and emailed: the booking is complete. The thank-you page is
        // its own page; its "How did you hear about us?" is a separate,
        // optional follow-up that only refers back to this booking.
        const answers = [];
        for (const field of fields) {
            if (["hidden", "textarea", "consent_marketing"].includes(field.type)) continue;
            let value = payload[field.name];
            if (field.type === "checkbox") value = value ? "Yes" : "";
            if (value === "" || value === undefined || value === null || (Array.isArray(value) && !value.length)) continue;
            answers.push({ name: field.name, label: field.label || field.name, value: Array.isArray(value) ? value.join(", ") : String(value) });
        }
        saveBookingRef({ sentAt: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }), answers });
        setStatus({ state: "done", message: "" });
        router.push(THANK_YOU_PATH);
    }

    const indexed = fields.map((field, index) => ({ field, index }));
    const longFields = indexed.filter(({ field }) => field.type === "textarea");
    const hiddenFields = indexed.filter(({ field }) => field.type === "hidden");
    // The marketing opt-in is not a step: it sits just above the button.
    const optIns = indexed.filter(({ field }) => field.type === "consent_marketing");
    const groups = GROUP_ORDER.map((key) => {
        const all = indexed.filter(({ field }) => !["textarea", "hidden", "consent_marketing"].includes(field.type) && groupOf(field) === key);
        // Inputs that sit two to a row (not pills, not full-width controls)
        // come first, so a row of pills never splits a pair.
        const pairs = ({ field }) => {
            const chips = field.type === "select" && optionList(field).length > 0 && optionList(field).length <= MAX_CHIPS;
            return !isWide(field) && !chips && field.type !== "checkbox" && field.type !== "consent_marketing";
        };
        const pairable = all.filter(pairs);
        const items = [...pairable, ...all.filter((item) => !pairs(item))];
        // With an odd number, the last one takes the whole row.
        const spanLast = pairable.length % 2 === 1 ? pairable[pairable.length - 1].index : -1;
        return { key, items, spanLast };
    }).filter((group) => group.items.length);
    const idPrefix = `quote-${variant}`;
    const fieldProps = ({ field, index }) => ({
        field,
        index,
        E,
        value: valueOf(field),
        error: errors[field.name],
        onChange: (v) => setValue(field.name, v),
        onBlur: () => blurField(field.name),
        idPrefix,
    });

    // Hidden by an admin: nothing is rendered for visitors.
    if (hidden) return null;

    const busy = status.state === "sending" || status.state === "done";

    return (
        <form ref={formRef} onSubmit={onSubmit} noValidate className="relative" aria-label="Book a free consultation" data-cms-form={FORM_NAME}>
            {editButton}

            {groups.map((group, step) => (
                <section key={step} aria-labelledby={`${idPrefix}-step-${group.key}`} className={step ? "mt-4 border-t border-[#E8EEF5] pt-4" : styles.stepFirst}>
                    <p id={`${idPrefix}-step-${group.key}`} className="flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#0F9E86]">
                        <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F7F4] text-[12px] tracking-normal text-[#0B6B5B]">
                            {step + 1}
                        </span>
                        <E.Text path={`groups.${group.key}`} />
                    </p>
                    <div className={styles.grid}>
                        {group.items.map((item, index) => (
                            <Field key={index} {...fieldProps(item)} styles={styles} span={item.index === group.spanLast} />
                        ))}
                    </div>
                </section>
            ))}

            {longFields.map((item, index) => (
                <div key={index} className={styles.textareaWrap}>
                    <Field {...fieldProps({ ...item, field: { ...item.field, width: "full" } })} styles={{ ...styles, full: "" }} />
                </div>
            ))}

            {optIns.map((item, index) => (
                <div key={index} className="mt-3">
                    <Field {...fieldProps(item)} styles={{ ...styles, full: "" }} />
                </div>
            ))}

            {hiddenFields.map(({ field }, index) => (
                <input key={index} type="hidden" name={field.name} value={valueOf(field)} />
            ))}

            {/* Spam trap: real visitors never see or fill this. */}
            <div aria-hidden="true" className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
                <label>
                    Leave this empty {/* cms-static: hidden spam-trap label */}
                    <input type="text" name={honeypot} tabIndex={-1} autoComplete="off" />
                </label>
            </div>

            {definition.consent?.required ? (
                <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#475569]">
                    <input type="checkbox" checked={!!values.consent} onChange={(e) => setValue("consent", e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#0F9E86]" />
                    <span><E.Text path="consent.text" /></span>
                </label>
            ) : null}
            {errors.consent ? <p role="alert" className="mt-1 text-[12px] text-[#D92D20]">{errors.consent}</p> : null}

            <button type="submit" disabled={busy} aria-busy={busy} className={styles.button}>
                {busy ? (
                    <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : null}
                <E.Text path="submitText" />
                {busy ? null : <FaArrowRight className={styles.arrow} />}
            </button>

            {status.state === "error" && status.message && (Object.values(errors).some(Boolean) || !Object.keys(errors).length) ? (
                <p role="alert" className="mt-2 text-center text-[12px] text-[#D92D20]">{status.message}</p>
            ) : null}

            <div className={styles.note}>
                <FaLock className="shrink-0" />
                <span><E.Text path="privacyNote" /></span>
            </div>
        </form>
    );
}
