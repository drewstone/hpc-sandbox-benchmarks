import { defineProviderMeta } from "../provider-meta.ts";

export default defineProviderMeta("tangle", {
	displayName: "Tangle Sandbox",
	vendor: "Tangle",
	website: "https://sandbox.tangle.tools",
	sdkPackage: "@tangle-network/sandbox",
	// The create's `environment` takes an arbitrary OCI reference, so the shared toolchain image is
	// booted directly; there is no provider-side template to bake.
	artifact: { kind: "image" },
	inputs: [
		"TANGLE_API_KEY",
		{ name: "TANGLE_SANDBOX_BASE_URL", source: { kind: "variable" }, required: false },
	],
	isolation: {
		class: "container",
		technology: "container (Docker driver, platform default)",
		notes:
			"Declared from the platform's default create path (no `driver` requested); the SDK also exposes Firecracker and host-agent drivers that this adapter does not select. Confirm with the in-guest isolation probe before publication.",
	},
	pricing: {
		model: "published",
		components: [
			{
				id: "cpu",
				resource: "cpu",
				billingBasis: "provisioned",
				vendorUnit: "vCPU",
				usdPerUnitHour: 0.010445613415710504,
				quantityRule: { kind: "linear", dimension: "vcpus", unitsPerTargetUnit: 1 },
			},
			{
				id: "memory",
				resource: "memory",
				billingBasis: "provisioned",
				vendorUnit: "GB",
				usdPerUnitHour: 0.007050789055604591,
				quantityRule: { kind: "linear", dimension: "memoryGb", unitsPerTargetUnit: 1 },
			},
			{
				id: "disk",
				resource: "disk",
				billingBasis: "provisioned",
				vendorUnit: "GB",
				usdPerUnitHour: 0.0007344571932921447,
				quantityRule: { kind: "linear", dimension: "diskGb", unitsPerTargetUnit: 1 },
			},
		],
		targetHourlyCost: { kind: "exact", componentIds: ["cpu", "memory", "disk"] },
		notes:
			"The published `general` pool rate card (source: reference-constants) bills the requested size while the sandbox runs, with a $0.04/hr minimum charge; the 4 vCPU / 8 GB / 40 GB target is about $0.128/hr. Sizes above 1 vCPU / 2 GB need a paid plan (Pro: 8 vCPU / 16 GB, 25 concurrent sandboxes).",
		sources: [
			{
				label: "Tangle Sandbox rate card",
				url: "https://sandbox.tangle.tools/v1/pricing/sandboxes",
				checkedAt: "2026-10-11",
			},
		],
		adjustments: [
			{
				kind: "fee",
				plan: "Pro",
				resource: "plan",
				quantity: 29,
				unit: "USD/month",
				scope: "monthly",
				notes:
					"Includes a $30 monthly usage balance; the first plan whose limits admit the target shape.",
			},
		],
	},
	maturity: {
		status: "beta",
		notes:
			"Native @tangle-network/sandbox driver (isolated, agent-free, ephemeral create booting the shared toolchain image; blocking exec; spawned background processes; delete observed to 404). Opt-in until driver-check passes and a committed validation run exists.",
	},
	// The hosted runtime injects an unprivileged guest UID.
	runtimeIdentity: "unprivileged",
	specPinning: "settable",
	transport: {
		streaming: false,
		syncCapMs: 60_000,
		detachedPoll: true,
	},
});
