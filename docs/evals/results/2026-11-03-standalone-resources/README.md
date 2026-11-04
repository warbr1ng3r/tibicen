# Exact candidate resources outside the checkout

On 3 November 2026 both conditional local **1.0.0** skills passed actual version/resource checks with the copied distribution and working directory physically outside the source checkout. Node **24.15.0**, macOS arm64; four calls passed, including two `self-test` calls. Git was absent from PATH and Node's filesystem read permission allowed only the copied distribution. No model, installer, project command or network request was part of these calls; no OS network-isolation claim is made.

| Skill | Version | Resource self-test |
| --- | --- | --- |
| tibicen-init | 1.0.0 | passed / available |
| tibicen-adopt | 1.0.0 | passed / available |

Candidate archive SHA256: `7fed7ad4d3e27cf169ac29384f0807b9beae5689e6df0dbd1b11bac499ec7e55`. Distribution inventory SHA256: `37b384c03e7ea0b83a82960ec6512771d391c694ed312b60ac6b50ef26fa88a3`; all86payload paths matched before and after execution. The source distribution/archive and shared working payload remained unchanged. Exact argv, Node hash, scope/environment, stdout/stderr and timed receipts are retained in the local delegated-acceptance audit.

This supplies a new actual outside-checkout-cwd observation. The [older conditional-candidate receipt](../2026-10-31-private-rc-preview/README.md#conditional-10-candidate) and its cwd correction remain unchanged. Resource availability is not instruction loading, a useful agent task, Linux/Windows acceptance or public Git delivery. The [engineering assessment](../../ENGINEERING_ACCEPTANCE.md) retains those separate obligations; no 1.0 readiness or publication is claimed.
