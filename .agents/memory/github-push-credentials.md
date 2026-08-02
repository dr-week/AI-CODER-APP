---
name: GitHub push credentials
description: Replit workspace behavior when the normal GitHub origin has no source-control credential
---

When GitHub rejects the normal HTTPS origin with “Invalid username or token,” a configured secret-backed Git URL can be used for the push. Restore the origin to the credential-free repository URL afterward and fetch/set upstream so credentials are not retained in Git metadata.

**Why:** The connected GitHub integration and Git source-control credential are separate in this workspace; the normal `git push` can fail even though the account integration exists.

**How to apply:** Never print or inspect the secret value. Push with the environment-provided secret reference, then verify `git remote -v` and `git status --short --branch`.