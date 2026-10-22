# dsh-web-tune

[![ci](https://github.com/xyx-cmd-maker/dsh-web-tune/actions/workflows/ci.yml/badge.svg)](https://github.com/xyx-cmd-maker/dsh-web-tune/actions/workflows/ci.yml)

A DeepSeek Harness profile bundle that adjusts two rows other bundles own: it
pins [`dsh-free-search`](https://www.npmjs.com/package/dsh-free-search) to its
`auto` engine pool, and it keeps the web seam on the shipped providers so that
installing [`dsh-tinyfish`](https://www.npmjs.com/package/dsh-tinyfish) does not
silently take over every search and every fetch.

It ships no services, no tools, and no UI. The bundle exists to carry one patch
file, and `index.js` is empty on purpose.

## Why this exists

DeepSeek Harness composes a profile by stacking patch layers: each bundle in
`dsh.profile.bundles`, in list order, then the profile's own `cordis.patch.yml`.
Later layers win, and a patch replaces a row's whole `config` object rather than
merging keys.

`dsh-tinyfish` ships a patch that points both web providers at itself:

```yaml
- id: web
  config:
    searchProvider: tinyfish
    fetchProvider: tinyfish
```

That is reasonable for a package whose only job is TinyFish, but it changes two
global decisions the moment it is installed. With no TinyFish credential
configured, `web_search` and `web_fetch` fail, and the free-search plugin stops
being used for search because the seam no longer points at it.

A host that wants a different arrangement has to override those rows in a later
layer. That is all this bundle does. Its README section on choosing providers
says the same thing and shows the same patch shape.

## Install

```sh
# track the default branch
dsh plugin --profile <profile> add github:xyx-cmd-maker/dsh-web-tune

# or pin a release, which is what you want for a working setup
dsh plugin --profile <profile> add github:xyx-cmd-maker/dsh-web-tune#v1.0.0
```

`main` also carries documentation and CI changes, so tracking it means the
checkout moves for reasons that do not affect behaviour. A tag does not.

The bundle must be the last one in `dsh.profile.bundles`, because patch layers
apply in list order and this one has to come after the bundles it overrides.
`dsh plugin add` appends, so a fresh install is already last. Installing it
before `dsh-free-search` or `dsh-tinyfish` will silently lose the override.

Restart the Harness, or let the plugin manager reload the layer.

## What it sets

```yaml
- insert:
    - id: web-tune
      name: dsh-web-tune
      config: {}

- id: web-search-free
  config:
    provider: auto
    disabledEngines: []
    bingMarket: zh-CN
    fetchProviderTakeover: false

- id: web
  config:
    searchProvider: deepseek-official
    fetchProvider: http
```

Four decisions, each deliberate:

`provider: auto` routes across the enabled engines and falls back when one fails.
A fixed engine is a single point of failure: DuckDuckGo, for example, is
unreachable from some networks and returns a connection error, which makes a
`ddg`-pinned setup return nothing at all.

`fetchProviderTakeover: false` stops the search plugin from also repointing
`fetch`. Its default is `true`, which routes fetches through its own extractor.

`searchProvider: deepseek-official` is the shipped default rather than an engine
id. `dsh-free-search` takes the field over at runtime while it still reads as
that default, so search still goes through the free pool. Writing a concrete
provider id here would leave a dangling reference if the plugin is later
disabled, which is the failure its own patch file documents.

`fetchProvider: http` keeps fetches on the built-in provider. Nothing leaves the
machine except the request itself.

## Switching fetch to TinyFish

The web seam holds one fetch provider for the whole process; there is no
per-request override. Changing it is a configuration change, made once.

Edit `cordis.patch.yml`:

```yaml
- id: web
  config:
    searchProvider: deepseek-official
    fetchProvider: tinyfish
```

then reinstall so the layer is re-applied in last position:

```sh
dsh plugin --profile <profile> remove dsh-web-tune
dsh plugin --profile <profile> add github:xyx-cmd-maker/dsh-web-tune
```

TinyFish needs a credential before this is useful. Store it through the
Harness credential service or the plugin's own settings card, not in this file.

If you would rather have one provider and no switching at all, this is the
arrangement to pick once a key exists: TinyFish handles the pages that need
JavaScript, and free-search keeps search. Keeping `http` is the better choice
only if you care that ordinary page URLs stay local.

## Uninstall

```sh
dsh plugin --profile <profile> remove dsh-web-tune
```

Removing it restores `bing` as the free-search engine and lets `dsh-tinyfish`
take the web providers, which is the state before this bundle existed. Remove
`dsh-tinyfish` first if you want the shipped providers back without either.

## Compatibility

`engines.dsh` is `>=0.2.0 <0.3.0`. Tested against DSH `0.2.1-rc.2`.

The rows it overrides belong to other packages. If `dsh-free-search` renames
`provider` or drops `fetchProviderTakeover`, the corresponding entry here stops
having an effect; an unknown key in a row's config is ignored rather than
fatal, so the failure mode is a setting that quietly does nothing. Check the
plugin's own config schema after a major upgrade.

## Checks

```sh
node --check index.js
node scripts/check_manifest.mjs
python3 -c "import yaml; yaml.safe_load(open('cordis.patch.yml'))"
```

`check_manifest.mjs` runs without dependencies and asserts more than syntax: the
manifest is self-consistent, every file it names exists, and the patch still says
`provider: auto`, `fetchProviderTakeover: false`, `searchProvider:
deepseek-official`, `fetchProvider: http`. Those four lines are the bundle's
entire purpose, so deleting one is a regression even though the YAML stays valid.

The same three commands run in CI on every push and pull request.

## License

MIT. See [LICENSE](LICENSE).

---

## 中文说明

这是给 DeepSeek Harness 用的一个**纯配置层**，不含任何运行时逻辑。它做两件事：

1. 把 `dsh-free-search` 的引擎池固定为 `auto`（失败自动回落，不押注单一引擎）；
2. 把 web seam 的两个 provider 还原成出厂值，避免装了 `dsh-tinyfish` 之后所有搜索和抓取都被它接管。

**为什么需要它**：补丁层按 `dsh.profile.bundles` 的顺序叠加，后装者赢；`dsh-tinyfish` 的补丁会把 `searchProvider` 和 `fetchProvider` 一起指向自己。没有它的（免费）密钥时，搜索和抓取都会失败。这一层就是在它之后把配置改回来。

**注意**：本包必须排在 bundle 列表末尾，装完再动别的 bundle 时要留意顺序。

切到 TinyFish 抓取：把 `fetchProvider: http` 改成 `tinyfish`，重新安装一次即可（重装是为了让它保持在最后一层）。密钥请存进 Harness 的凭据服务或插件设置页，不要写进本文件。
