# v0.2.17
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json

ALLOWED_VERDICTS = (
    "CONFIRMED_ORIGINAL",
    "LIKELY_COPIED",
    "HEAVILY_INSPIRED",
    "PROPERLY_CREDITED_REMIX",
    "COMMON_IDEA",
    "INSUFFICIENT_EVIDENCE",
    "FALSE_CLAIM",
)

ALLOWED_CONFIDENCE = ("LOW", "MEDIUM", "HIGH")

WORK_STATUS_ACTIVE = "ACTIVE"

CASE_STATUS_OPEN = "OPEN"
CASE_STATUS_RESPONSE = "RESPONSE_SUBMITTED"
CASE_STATUS_REQUESTED = "VERDICT_REQUESTED"
CASE_STATUS_RESOLVED = "RESOLVED"


class CreatorCourt(gl.Contract):
    owner: Address
    work_count: u256
    case_count: u256

    works: TreeMap[str, str]
    cases: TreeMap[str, str]
    responses: TreeMap[str, str]
    verdicts: TreeMap[str, str]

    creator_profiles: TreeMap[str, str]
    creator_works: TreeMap[str, str]
    creator_cases: TreeMap[str, str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.work_count = u256(0)
        self.case_count = u256(0)

    # ---------------------------------------------------------------------
    # Internal helpers
    # ---------------------------------------------------------------------

    def _fail(self, message: str) -> None:
        raise gl.vm.UserError(message)

    def _sender(self) -> str:
        return str(gl.message.sender_address)

    def _now_marker(self) -> str:
        # Studio timestamps can be awkward across environments.
        # This deterministic marker is enough for contract ordering.
        return str(self.work_count + self.case_count)

    def _safe_json_obj(self, raw: str) -> dict:
        if not raw:
            return {}
        try:
            data = json.loads(raw)
            if isinstance(data, dict):
                return data
            return {}
        except Exception:
            return {}

    def _safe_json_list(self, raw: str) -> list:
        if not raw:
            return []
        try:
            data = json.loads(raw)
            if isinstance(data, list):
                return data
            return []
        except Exception:
            return []

    def _clamp_i32(self, value: int, low: int, high: int) -> int:
        if value < low:
            return low
        if value > high:
            return high
        return value

    def _load_profile(self, address: str) -> dict:
        raw = self.creator_profiles.get(address, "")
        profile = self._safe_json_obj(raw)

        if not profile:
            return {
                "address": address,
                "handle": "",
                "total_works": 0,
                "total_cases_opened": 0,
                "cases_won": 0,
                "cases_lost": 0,
                "false_claims": 0,
                "times_accused": 0,
                "confirmed_originals": 0,
                "reputation_score": 0,
            }

        if "address" not in profile:
            profile["address"] = address
        if "handle" not in profile:
            profile["handle"] = ""
        if "total_works" not in profile:
            profile["total_works"] = 0
        if "total_cases_opened" not in profile:
            profile["total_cases_opened"] = 0
        if "cases_won" not in profile:
            profile["cases_won"] = 0
        if "cases_lost" not in profile:
            profile["cases_lost"] = 0
        if "false_claims" not in profile:
            profile["false_claims"] = 0
        if "times_accused" not in profile:
            profile["times_accused"] = 0
        if "confirmed_originals" not in profile:
            profile["confirmed_originals"] = 0
        if "reputation_score" not in profile:
            profile["reputation_score"] = 0

        return profile

    def _save_profile(self, address: str, profile: dict) -> None:
        self.creator_profiles[address] = json.dumps(profile, sort_keys=True)

    def _append_index(self, store: TreeMap[str, str], key: str, value: str) -> None:
        items = self._safe_json_list(store.get(key, "[]"))

        already_exists = False
        for item in items:
            if str(item) == value:
                already_exists = True

        if not already_exists:
            items.append(value)

        store[key] = json.dumps(items)

    def _normalise_tags_json(self, tags_json: str) -> str:
        if not tags_json:
            return "[]"

        tags = self._safe_json_list(tags_json)
        clean = []

        for tag in tags:
            value = str(tag).strip()
            if value and len(clean) < 12:
                clean.append(value[:48])

        return json.dumps(clean)

    def _normalise_links_json(self, links_json: str) -> str:
        if not links_json:
            return "[]"

        links = self._safe_json_list(links_json)
        clean = []

        for link in links:
            value = str(link).strip()
            if value and len(clean) < 10:
                clean.append(value[:300])

        return json.dumps(clean)

    # ---------------------------------------------------------------------
    # Write: works
    # ---------------------------------------------------------------------

    @gl.public.write
    def register_original_work(
        self,
        work_id: str,
        title: str,
        content_type: str,
        original_url: str,
        description: str,
        evidence_cid: str,
        content_hash: str,
        creator_handle: str,
        tags_json: str,
    ) -> str:
        work_id = str(work_id).strip()
        title = str(title).strip()
        content_type = str(content_type).strip()
        evidence_cid = str(evidence_cid).strip()
        content_hash = str(content_hash).strip()

        if not work_id:
            self._fail("work_id required")
        if self.works.get(work_id, ""):
            self._fail("work_id already exists")
        if not title:
            self._fail("title required")
        if not content_type:
            self._fail("content_type required")
        if not evidence_cid:
            self._fail("evidence_cid required")
        if not content_hash:
            self._fail("content_hash required")

        creator = self._sender()

        record = {
            "work_id": work_id,
            "creator": creator,
            "creator_handle": str(creator_handle or "")[:80],
            "title": title[:180],
            "content_type": content_type[:80],
            "original_url": str(original_url or "")[:400],
            "description": str(description or "")[:1600],
            "evidence_cid": evidence_cid[:160],
            "content_hash": content_hash[:160],
            "tags": self._normalise_tags_json(tags_json),
            "status": WORK_STATUS_ACTIVE,
            "created_at": self._now_marker(),
        }

        self.works[work_id] = json.dumps(record, sort_keys=True)
        self.work_count = self.work_count + u256(1)

        profile = self._load_profile(creator)
        profile["total_works"] = int(profile.get("total_works", 0)) + 1

        clean_handle = str(creator_handle or "").strip()
        if clean_handle and not profile.get("handle"):
            profile["handle"] = clean_handle[:80]

        self._save_profile(creator, profile)
        self._append_index(self.creator_works, creator, work_id)

        return work_id

    # ---------------------------------------------------------------------
    # Write: cases
    # ---------------------------------------------------------------------

    @gl.public.write
    def open_copy_case(
        self,
        case_id: str,
        original_work_id: str,
        suspected_url: str,
        accused_address: str,
        accused_handle: str,
        claim_type: str,
        claim_explanation: str,
        evidence_cid: str,
        comparison_notes: str,
    ) -> str:
        case_id = str(case_id).strip()
        original_work_id = str(original_work_id).strip()
        claim_type = str(claim_type).strip()
        evidence_cid = str(evidence_cid).strip()

        if not case_id:
            self._fail("case_id required")
        if self.cases.get(case_id, ""):
            self._fail("case_id already exists")
        if not self.works.get(original_work_id, ""):
            self._fail("original work not found")
        if not claim_type:
            self._fail("claim_type required")
        if not evidence_cid:
            self._fail("evidence_cid required")

        claimant = self._sender()
        accused = str(accused_address or "").strip()

        record = {
            "case_id": case_id,
            "claimant": claimant,
            "original_work_id": original_work_id,
            "suspected_url": str(suspected_url or "")[:400],
            "accused_address": accused,
            "accused_handle": str(accused_handle or "")[:80],
            "claim_type": claim_type[:80],
            "claim_explanation": str(claim_explanation or "")[:1800],
            "evidence_cid": evidence_cid[:160],
            "comparison_notes": str(comparison_notes or "")[:1800],
            "status": CASE_STATUS_OPEN,
            "created_at": self._now_marker(),
        }

        self.cases[case_id] = json.dumps(record, sort_keys=True)
        self.case_count = self.case_count + u256(1)

        claimant_profile = self._load_profile(claimant)
        claimant_profile["total_cases_opened"] = int(
            claimant_profile.get("total_cases_opened", 0)
        ) + 1
        self._save_profile(claimant, claimant_profile)
        self._append_index(self.creator_cases, claimant, case_id)

        if accused:
            accused_profile = self._load_profile(accused)
            accused_profile["times_accused"] = int(
                accused_profile.get("times_accused", 0)
            ) + 1

            clean_accused_handle = str(accused_handle or "").strip()
            if clean_accused_handle and not accused_profile.get("handle"):
                accused_profile["handle"] = clean_accused_handle[:80]

            self._save_profile(accused, accused_profile)
            self._append_index(self.creator_cases, accused, case_id)

        return case_id

    # ---------------------------------------------------------------------
    # Write: responses
    # ---------------------------------------------------------------------

    @gl.public.write
    def submit_response(
        self,
        case_id: str,
        defence_statement: str,
        evidence_cid: str,
        response_links_json: str,
    ) -> str:
        case_id = str(case_id).strip()
        case_raw = self.cases.get(case_id, "")

        if not case_raw:
            self._fail("case not found")

        case = self._safe_json_obj(case_raw)
        status = str(case.get("status", ""))

        if status != CASE_STATUS_OPEN and status != CASE_STATUS_RESPONSE:
            self._fail("case not open for response")

        responder = self._sender()
        accused = str(case.get("accused_address", "") or "").strip()

        if accused and responder != accused:
            self._fail("only accused address may respond")

        record = {
            "case_id": case_id,
            "responder": responder,
            "defence_statement": str(defence_statement or "")[:2200],
            "evidence_cid": str(evidence_cid or "")[:160],
            "response_links": self._normalise_links_json(response_links_json),
            "submitted_at": self._now_marker(),
        }

        self.responses[case_id] = json.dumps(record, sort_keys=True)

        case["status"] = CASE_STATUS_RESPONSE
        case["responder"] = responder
        self.cases[case_id] = json.dumps(case, sort_keys=True)

        return case_id

    # ---------------------------------------------------------------------
    # Write: verdict
    # ---------------------------------------------------------------------

    @gl.public.write
    def request_verdict(self, case_id: str) -> str:
        case_id = str(case_id).strip()
        case_raw = self.cases.get(case_id, "")

        if not case_raw:
            self._fail("case not found")
        if self.verdicts.get(case_id, ""):
            self._fail("verdict already exists")

        case = self._safe_json_obj(case_raw)

        if str(case.get("status", "")) == CASE_STATUS_RESOLVED:
            self._fail("case already resolved")

        original_work_id = str(case.get("original_work_id", "") or "")
        work_raw = self.works.get(original_work_id, "")

        if not work_raw:
            self._fail("linked original work missing")

        response_raw = self.responses.get(case_id, "")

        def leader_judgement() -> str:
            prompt = self._build_prompt(work_raw, json.dumps(case, sort_keys=True), response_raw)
            raw = gl.nondet.exec_prompt(prompt, response_format="json")
            return self._parse_verdict_json(raw)

        verdict_json = gl.eq_principle.prompt_non_comparative(
            leader_judgement,
            task=(
                "Review a creator originality dispute and return one strict JSON verdict. "
                "The output must choose one allowed verdict and one allowed confidence band."
            ),
            criteria=(
                "The output must be valid JSON only. "
                "The verdict must be one of CONFIRMED_ORIGINAL, LIKELY_COPIED, HEAVILY_INSPIRED, "
                "PROPERLY_CREDITED_REMIX, COMMON_IDEA, INSUFFICIENT_EVIDENCE, FALSE_CLAIM. "
                "The confidence must be LOW, MEDIUM, or HIGH. "
                "The summary, reasons, and limitations must be consistent with the original work, "
                "the copy case, and the accused response. "
                "The response must not use legal conclusions such as guilty, liable, infringement, or damages."
            ),
        )

        verdict = self._safe_json_obj(verdict_json)

        if str(verdict.get("verdict", "")) not in ALLOWED_VERDICTS:
            verdict["verdict"] = "INSUFFICIENT_EVIDENCE"

        if str(verdict.get("confidence", "")) not in ALLOWED_CONFIDENCE:
            verdict["confidence"] = "LOW"

        verdict["case_id"] = case_id
        verdict["decided_at"] = self._now_marker()

        final_verdict_json = json.dumps(verdict, sort_keys=True)
        self.verdicts[case_id] = final_verdict_json

        case["status"] = CASE_STATUS_RESOLVED
        case["verdict"] = verdict["verdict"]
        self.cases[case_id] = json.dumps(case, sort_keys=True)

        self._apply_reputation(case, verdict)

        return final_verdict_json

    def _build_prompt(self, work_json: str, case_json: str, response_json: str) -> str:
        return (
            "You are an impartial originality and attribution reviewer for an internet creator dispute.\n"
            "You are not a court of law. Do not use legal language like guilty, liable, infringement, or damages.\n"
            "Judge originality, similarity, timeline plausibility, attribution, and evidence quality.\n\n"
            "ORIGINAL WORK RECORD JSON:\n"
            + work_json
            + "\n\nCOPY CASE JSON:\n"
            + case_json
            + "\n\nACCUSED RESPONSE JSON, MAY BE EMPTY:\n"
            + (response_json or "{}")
            + "\n\n"
            "Consider:\n"
            "- timeline plausibility based on stated timestamps, URLs, CIDs, and hashes\n"
            "- whether wording, structure, examples, code, concepts, or visuals overlap meaningfully\n"
            "- whether the accused credited the original creator\n"
            "- whether the alleged similarity is merely a common idea in the field\n"
            "- whether the claimant's evidence is sufficient\n"
            "- whether the claim appears weak, exaggerated, or abusive\n\n"
            "Choose exactly one verdict from:\n"
            "CONFIRMED_ORIGINAL, LIKELY_COPIED, HEAVILY_INSPIRED, PROPERLY_CREDITED_REMIX, "
            "COMMON_IDEA, INSUFFICIENT_EVIDENCE, FALSE_CLAIM.\n\n"
            "Choose exactly one confidence band: LOW, MEDIUM, HIGH.\n"
            "Reputation deltas must be small integers from -15 to 15.\n\n"
            "Return STRICT JSON ONLY in this exact shape:\n"
            "{\n"
            '  "verdict": "LIKELY_COPIED",\n'
            '  "confidence": "HIGH",\n'
            '  "summary": "Plain-English one paragraph summary.",\n'
            '  "reasons": ["short reason 1", "short reason 2"],\n'
            '  "limitations": ["what could not be fully verified"],\n'
            '  "reputation_impact": { "claimant_delta": 5, "accused_delta": -8 }\n'
            "}\n"
        )

    def _parse_verdict_json(self, raw) -> str:
        if isinstance(raw, dict):
            data = raw
        else:
            text = str(raw or "").strip()

            if text.startswith("```"):
                text = text.strip("`").strip()
                if text.lower().startswith("json"):
                    text = text[4:].strip()

            start = text.find("{")
            end = text.rfind("}")

            if start == -1 or end == -1 or end <= start:
                raise gl.vm.UserError("verdict not JSON")

            candidate = text[start : end + 1]

            try:
                data = json.loads(candidate)
            except Exception:
                raise gl.vm.UserError("verdict JSON could not be parsed")

        verdict = str(data.get("verdict", "INSUFFICIENT_EVIDENCE")).upper()
        confidence = str(data.get("confidence", "LOW")).upper()

        if verdict not in ALLOWED_VERDICTS:
            verdict = "INSUFFICIENT_EVIDENCE"

        if confidence not in ALLOWED_CONFIDENCE:
            confidence = "LOW"

        summary = str(data.get("summary", ""))[:1200]

        reasons_raw = data.get("reasons", [])
        if not isinstance(reasons_raw, list):
            reasons_raw = [str(reasons_raw)]

        reasons = []
        for reason in reasons_raw:
            value = str(reason).strip()
            if value and len(reasons) < 6:
                reasons.append(value[:240])

        limitations_raw = data.get("limitations", [])
        if not isinstance(limitations_raw, list):
            limitations_raw = [str(limitations_raw)]

        limitations = []
        for limitation in limitations_raw:
            value = str(limitation).strip()
            if value and len(limitations) < 6:
                limitations.append(value[:240])

        impact = data.get("reputation_impact", {})
        if not isinstance(impact, dict):
            impact = {}

        try:
            claimant_delta = int(impact.get("claimant_delta", 0))
        except Exception:
            claimant_delta = 0

        try:
            accused_delta = int(impact.get("accused_delta", 0))
        except Exception:
            accused_delta = 0

        claimant_delta = self._clamp_i32(claimant_delta, -15, 15)
        accused_delta = self._clamp_i32(accused_delta, -15, 15)

        normalised = {
            "verdict": verdict,
            "confidence": confidence,
            "summary": summary,
            "reasons": reasons,
            "limitations": limitations,
            "reputation_impact": {
                "claimant_delta": claimant_delta,
                "accused_delta": accused_delta,
            },
        }

        return json.dumps(normalised, sort_keys=True)

    def _apply_reputation(self, case: dict, verdict: dict) -> None:
        claimant = str(case.get("claimant", "") or "")
        accused = str(case.get("accused_address", "") or "")

        impact = verdict.get("reputation_impact", {})
        if not isinstance(impact, dict):
            impact = {}

        try:
            claimant_delta = int(impact.get("claimant_delta", 0))
        except Exception:
            claimant_delta = 0

        try:
            accused_delta = int(impact.get("accused_delta", 0))
        except Exception:
            accused_delta = 0

        claimant_delta = self._clamp_i32(claimant_delta, -15, 15)
        accused_delta = self._clamp_i32(accused_delta, -15, 15)

        code = str(verdict.get("verdict", "") or "")

        if claimant:
            claimant_profile = self._load_profile(claimant)
            claimant_profile["reputation_score"] = int(
                claimant_profile.get("reputation_score", 0)
            ) + claimant_delta

            if code == "LIKELY_COPIED" or code == "HEAVILY_INSPIRED" or code == "CONFIRMED_ORIGINAL":
                claimant_profile["cases_won"] = int(
                    claimant_profile.get("cases_won", 0)
                ) + 1

                if code == "CONFIRMED_ORIGINAL":
                    claimant_profile["confirmed_originals"] = int(
                        claimant_profile.get("confirmed_originals", 0)
                    ) + 1

            elif code == "FALSE_CLAIM":
                claimant_profile["false_claims"] = int(
                    claimant_profile.get("false_claims", 0)
                ) + 1
                claimant_profile["cases_lost"] = int(
                    claimant_profile.get("cases_lost", 0)
                ) + 1

            elif code == "COMMON_IDEA" or code == "PROPERLY_CREDITED_REMIX":
                claimant_profile["cases_lost"] = int(
                    claimant_profile.get("cases_lost", 0)
                ) + 1

            self._save_profile(claimant, claimant_profile)

        if accused:
            accused_profile = self._load_profile(accused)
            accused_profile["reputation_score"] = int(
                accused_profile.get("reputation_score", 0)
            ) + accused_delta
            self._save_profile(accused, accused_profile)

    # ---------------------------------------------------------------------
    # Views
    # ---------------------------------------------------------------------

    @gl.public.view
    def get_work(self, work_id: str) -> str:
        return self.works.get(str(work_id), "")

    @gl.public.view
    def get_case(self, case_id: str) -> str:
        return self.cases.get(str(case_id), "")

    @gl.public.view
    def get_response(self, case_id: str) -> str:
        return self.responses.get(str(case_id), "")

    @gl.public.view
    def get_verdict(self, case_id: str) -> str:
        return self.verdicts.get(str(case_id), "")

    @gl.public.view
    def get_creator_profile(self, address: str) -> str:
        return self.creator_profiles.get(str(address), "")

    @gl.public.view
    def get_creator_works(self, address: str) -> str:
        return self.creator_works.get(str(address), "[]")

    @gl.public.view
    def get_creator_cases(self, address: str) -> str:
        return self.creator_cases.get(str(address), "[]")

    @gl.public.view
    def get_counts(self) -> str:
        return json.dumps(
            {
                "works": str(self.work_count),
                "cases": str(self.case_count),
            },
            sort_keys=True,
        )