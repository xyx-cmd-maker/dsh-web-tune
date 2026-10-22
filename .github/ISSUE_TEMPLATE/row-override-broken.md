---
name: The override stopped working
about: One of the rows this bundle overrides changed shape, so the patch no longer takes effect.
title: "[override] "
labels: []
---

This bundle is coupled to things other packages own: the `web-search-free` row
from `dsh-free-search`, and the `web` row from the Harness core. If either plugin
renames a config key, this patch keeps applying but stops changing behaviour. The
symptom is not an error — it is a setting that quietly does nothing.

<!-- Please fill in the sections below. Delete the ones that do not apply. -->

## What changed for you

<!-- e.g. "the engine pool went back to bing after upgrading dsh-free-search to 0.9.20"
     or "web_fetch now goes through TinyFish despite fetchProvider: http" -->

## Versions

| Component | Version |
|---|---|
| dsh-web-tune | <!-- from package.json, or the Plugins card --> |
| DeepSeek Harness | <!-- `dsh --version` --> |
| dsh-free-search | <!-- Plugins list --> |
| dsh-tinyfish | <!-- Plugins list, if installed --> |

## Row config as the Harness sees it

<!-- Paste what the row actually holds. In a session with the inspect tool available:

     cordis_inspect_query  platform=host  provider=Config  method=listConfigs
                           input={"name":"dsh-free-search"}

     then query the returned entry id. The schema it prints is what the plugin
     expects; compare it with the keys in this repo's cordis.patch.yml. -->

```yaml
# paste here
```

## Bundle order

<!-- This layer only wins if it comes after the bundles it overrides.

     dsh plugin --profile <profile> list
     # or read dsh.profile.bundles in the profile's package.json -->

```
# paste the bundles list here
```

## Anything else

<!-- Screenshots of the Plugins card, if the row shows a validation warning. -->
