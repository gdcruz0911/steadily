"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  verifyAdvancedOfficialInformation,
  confirmOfficialInformation,
  findOfficialInformation,
  markOfficialInformationUnavailable,
} from "@/app/medications/[id]/reference/actions";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import type { MedicationReference } from "@/db/medication-references";
import type { OfficialSourceCandidate } from "@/lib/medication-references/dailymed";

type MedicationReferenceFlowProps = {
  medicationId: string;
  reference: MedicationReference | null;
  selectedFormOrRoute: string;
};

function Candidate({
  candidate,
  medicationId,
  selectedFormOrRoute,
}: {
  candidate: OfficialSourceCandidate;
  medicationId: string;
  selectedFormOrRoute: string;
}) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(
    confirmOfficialInformation.bind(null, medicationId),
    {},
  );

  useEffect(() => {
    if (state.status === "confirmed") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <li className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <h2 className="break-words font-semibold">{candidate.confirmedProductName}</h2>
        <p className="text-sm text-[var(--muted-foreground)]">{candidate.formulationOrRoute}</p>
        <p className="text-sm text-[var(--muted-foreground)]">Selected form or route: {selectedFormOrRoute}</p>
        {candidate.manufacturerOrLabeler ? (
          <p className="text-sm text-[var(--muted-foreground)]">Labeler: {candidate.manufacturerOrLabeler}</p>
        ) : null}
        {candidate.sourceRevisionDate ? (
          <p className="text-sm text-[var(--muted-foreground)]">Source date: {candidate.sourceRevisionDate}</p>
        ) : null}
      </div>
      <a className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[var(--accent)] underline decoration-2 underline-offset-4 hover:text-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" href={candidate.sourceUrl} rel="noreferrer" target="_blank">
        Read official information
      </a>
      <p className="text-sm text-[var(--muted-foreground)]">Review the official link before confirming.</p>
      <form action={action} className="space-y-3">
        <input name="sourceIdentifier" type="hidden" value={candidate.sourceIdentifier} />
        {state.error ? <p className="text-sm font-medium text-[var(--error)]" role="alert">{state.error}</p> : null}
        <Button disabled={isPending} type="submit">{isPending ? "Confirming" : "This is my medication"}</Button>
      </form>
    </li>
  );
}

function ConfirmedReference({ reference }: { reference: MedicationReference }) {
  if (!reference.sourceUrl || !reference.officialTitle) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-xl border border-[var(--success)] bg-white p-4 shadow-sm" aria-labelledby="official-reference-heading">
      <StatusBadge tone="success">Official reference confirmed</StatusBadge>
      <h2 className="break-words text-lg font-semibold" id="official-reference-heading">{reference.officialTitle}</h2>
      {reference.formulationOrRoute ? <p className="text-sm text-[var(--muted-foreground)]">{reference.formulationOrRoute}</p> : null}
      {reference.sourceRevisionDate ? <p className="text-sm text-[var(--muted-foreground)]">Source date: {reference.sourceRevisionDate}</p> : null}
      {reference.retrievedAt ? <p className="text-sm text-[var(--muted-foreground)]">Retrieved: {new Date(reference.retrievedAt).toLocaleDateString()}</p> : null}
      <a className="inline-flex min-h-12 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white active:translate-y-px hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" href={reference.sourceUrl} rel="noreferrer" target="_blank">
        Read official information
      </a>
    </section>
  );
}

export function MedicationReferenceFlow({
  medicationId,
  reference,
  selectedFormOrRoute,
}: MedicationReferenceFlowProps) {
  const [searchState, searchAction, isSearching] = useActionState(
    findOfficialInformation.bind(null, medicationId),
    {},
  );
  const [advancedState, advancedAction, isAdvancedPending] = useActionState(
    verifyAdvancedOfficialInformation.bind(null, medicationId),
    {},
  );
  const [unavailableState, unavailableAction, isUnavailablePending] = useActionState(
    markOfficialInformationUnavailable.bind(null, medicationId),
    {},
  );

  if (reference?.status === "confirmed") {
    return <ConfirmedReference reference={reference} />;
  }

  return (
    <div className="space-y-6">
      {reference?.status === "unavailable" || unavailableState.status === "unavailable" ? (
        <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm" aria-labelledby="unavailable-heading">
          <h2 className="text-lg font-semibold" id="unavailable-heading">Official reference unavailable</h2>
          <p className="text-sm text-[var(--muted-foreground)]">No confirmed official match is saved for this routine. You can try a DailyMed SET ID or official URL below.</p>
        </section>
      ) : null}

      {!searchState.lookupComplete ? (
        <form action={searchAction} className="space-y-4 rounded-xl border bg-white p-4 shadow-sm" noValidate>
          <h2 className="text-lg font-semibold">Find official information</h2>
          <p className="text-sm text-[var(--muted-foreground)]">To locate public official medication information, Steadily will send the medicine name and selected form/route to DailyMed. We do not send your name, dose history, symptoms, notes, or profile information.</p>
          <label className="flex min-h-12 items-start gap-3 rounded-xl border bg-[var(--surface-subtle)] p-3 text-sm font-medium">
            <input className="mt-1 size-4 accent-[var(--accent)]" name="lookupConsent" required type="checkbox" value="yes" />
            <span>I agree to this one-time official-source lookup.</span>
          </label>
          {searchState.error ? <p className="rounded-xl border border-[var(--error)] bg-[var(--error-soft)] p-3 text-sm font-medium text-[var(--error)]" role="alert">{searchState.error}</p> : null}
          <Button disabled={isSearching} type="submit">{isSearching ? "Searching DailyMed" : "Find official information"}</Button>
        </form>
      ) : null}

      {searchState.lookupComplete || advancedState.lookupComplete ? (
        <section className="space-y-4" aria-labelledby="candidate-heading">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold" id="candidate-heading">Choose the official record</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Only a record you explicitly confirm will be saved.</p>
          </div>
          {(searchState.candidates?.length || advancedState.candidates?.length) ? (
            <ul className="space-y-3">{[...(searchState.candidates ?? []), ...(advancedState.candidates ?? [])].map((candidate) => <Candidate candidate={candidate} key={candidate.sourceIdentifier} medicationId={medicationId} selectedFormOrRoute={selectedFormOrRoute} />)}</ul>
          ) : (
            <p className="rounded-xl border bg-white p-4 text-sm leading-6 text-[var(--muted-foreground)]">No candidate matched the selected form or route. We did not save a match.</p>
          )}
          <form action={unavailableAction}>
            <Button disabled={isUnavailablePending} type="submit" variant="secondary">{isUnavailablePending ? "Saving" : "None of these are correct"}</Button>
          </form>
        </section>
      ) : null}

      <details className="rounded-xl border bg-white p-4 shadow-sm">
        <summary className="min-h-11 cursor-pointer rounded-xl py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">Advanced: add an official DailyMed record</summary>
        <form action={advancedAction} className="mt-4 space-y-3" noValidate>
          <label className="block space-y-2 text-sm font-medium" htmlFor="officialSource">
            <span>DailyMed SET ID or official URL</span>
            <input aria-describedby="official-source-help" className="min-h-12 w-full rounded-xl border bg-white px-3" id="officialSource" name="officialSource" />
          </label>
          <p className="text-sm text-[var(--muted-foreground)]" id="official-source-help">Only a DailyMed SET ID or DailyMed official link is accepted.</p>
          {advancedState.error ? <p className="rounded-xl border border-[var(--error)] bg-[var(--error-soft)] p-3 text-sm font-medium text-[var(--error)]" role="alert">{advancedState.error}</p> : null}
          <Button disabled={isAdvancedPending} type="submit" variant="secondary">{isAdvancedPending ? "Checking" : "Review official record"}</Button>
        </form>
      </details>
    </div>
  );
}
