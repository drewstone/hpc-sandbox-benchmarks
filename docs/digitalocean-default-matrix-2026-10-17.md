# DigitalOcean default CPU benchmark selection

DigitalOcean MicroVMs (`digitalocean`) join the default `bench-matrix.yml` provider selection after
a complete DigitalOcean-only run on `main`. The driver landed in
[PR #688](https://github.com/starslingdev/hpc-sandbox-benchmarks/pull/688), and its request pacing
in [PR #690](https://github.com/starslingdev/hpc-sandbox-benchmarks/pull/690). This enables
routine collection with the suite registry's usual replicate counts and pass policy. The
release-required provider set is a separate policy and remains unchanged.

## Live validation on main

[Run 38723321092](https://github.com/starslingdev/hpc-sandbox-benchmarks/actions/runs/38723321092)
ran every CPU suite on DigitalOcean alone at `2dda80ca2`, the #690 merge, and was committed by
[PR #691](https://github.com/starslingdev/hpc-sandbox-benchmarks/pull/691) as
`data/dataset/runs/38723321092.json`.

- **Coverage:** 56 of 56 planned cells, with the usual replicate counts (3 per synthetic suite, 5
  for `cpu-node`, 12 per realworld suite). The provider is `validated`, with 65 metrics and no gaps.
  The "(partial)" in #691's title reflects the default `allow_partial` flag; the Run records no
  incomplete cell.
- **Duration:** 2 h 42 m (10:52–13:34 UTC on 2026-10-15) at 8 concurrent sandboxes.
- **Rate limits:** the run's logs contain no `[digitalocean] rate_limited` events and no 429s.
- **Spec:** the 4 vCPU / 8 GiB / 40 GB request maps to the smallest offered size covering it,
  8 vCPU / 16 GiB. The guest observed 8 vCPU and 15.64 GiB, so `specMatched` is false and the
  leaderboard ranks DigitalOcean with a comparability warning.

The previous attempt,
[run 38688902398](https://github.com/starslingdev/hpc-sandbox-benchmarks/actions/runs/38688902398),
failed: an openclaw replicate hit 429s during create verification and destroy, leaving an unresolved
create that blocked publication. #690 paces every request process-wide at 200 per minute, under the
measured account-wide limit of about 250, and honours `retry-after`.

## Account and capacity

- **Credentials:** `DIGITAL_OCEAN_TOKEN` is in the `privileged` environment.
- **Dedicated team:** the team holds only benchmark MicroVMs (`account-inventory`: `foreign=0`).
- **Journal:** the protected `benchmark-account-journal-digitalocean` journal branch exists.
- **Capacity:** `BENCH_ACCOUNT_CAPACITY.digitalocean` is `{"sandboxes": 8}`.
- **Limits:** the enforced limit is 100 running vCPUs per account (12 concurrent 8/16 MicroVMs).
  The next constraint is the account-wide request rate, shared by every caller of the token. See
  [`packages/digitalocean/README.md`](../packages/digitalocean/README.md) before raising capacity.
- **Releases:** don't run an unscoped toolchain release while DigitalOcean benchmarks. Its
  validation MicroVM shares the same vCPU and request budget.

## Comparability caveats

These are disclosed in provider metadata and must accompany any comparison:

- **Size:** DigitalOcean runs at twice the target's vCPU and memory, because sizes are fixed pairs.
  Parallel and memory-bandwidth workloads are favoured. Per-core comparisons should use tasks that
  can't use the extra size.
- **Cost:** priced as the 8/16 size, $0.312/h.
- **Region:** MKC1 (Kansas City) only during the public preview. The iperf3 WAN test can pick a
  same-metro server there.
- **Isolation:** commands run in a containerd container inside a Firecracker microVM.
