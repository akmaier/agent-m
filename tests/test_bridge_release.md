# Bridge Release Cases

The cases of tests/test_bridge_release.py: SPEC.md's check of THE BRIDGE IS ONE FILE PER PLATFORM, THE BRIDGE IS SIGNED BY ITS PUBLISHER and THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE. Each case states what is given, what is done and what is expected.

## One file per platform

### Case

```json
{
  "given": "The release build's configuration for each platform, made from the app's description, and a release published from three intact platform builds.",
  "input": {
    "kind": "one-file-per-platform"
  },
  "expected": {
    "targets": {
      "macos": [
        "dmg:universal",
        "zip:universal"
      ],
      "windows": [
        "nsis:x64"
      ],
      "linux": [
        "AppImage:x64"
      ]
    },
    "artifactNames": {
      "macos": "Agent-M-Bridge-2026.10.0-macos.${ext}",
      "windows": "Agent-M-Bridge-2026.10.0-windows.${ext}",
      "linux": "Agent-M-Bridge-2026.10.0-linux.${ext}"
    },
    "windowsInstaller": {
      "oneClick": true,
      "perMachine": false,
      "executionLevel": "asInvoker"
    },
    "carriesItsRuntime": true,
    "nodeIsNotAnOption": true,
    "published": "published",
    "downloadablePerPlatform": {
      "macos": 1,
      "windows": 1,
      "linux": 1
    },
    "downloadableFiles": [
      "Agent-M-Bridge-2026.10.0-linux.AppImage",
      "Agent-M-Bridge-2026.10.0-macos.dmg",
      "Agent-M-Bridge-2026.10.0-windows.exe"
    ]
  }
}
```

## A missing macOS build

### Case

```json
{
  "given": "Three platform builds of which the macOS build is missing; the other two are intact.",
  "input": {
    "kind": "missing-build",
    "platform": "macos"
  },
  "expected": {
    "error": "BuildMissing",
    "platform": "macos",
    "published": 0
  }
}
```

## A missing Windows build

### Case

```json
{
  "given": "Three platform builds of which the Windows build is missing; the other two are intact.",
  "input": {
    "kind": "missing-build",
    "platform": "windows"
  },
  "expected": {
    "error": "BuildMissing",
    "platform": "windows",
    "published": 0
  }
}
```

## A missing Linux build

### Case

```json
{
  "given": "Three platform builds of which the Linux build is missing; the other two are intact.",
  "input": {
    "kind": "missing-build",
    "platform": "linux"
  },
  "expected": {
    "error": "BuildMissing",
    "platform": "linux",
    "published": 0
  }
}
```

## A file changed after the build

### Case

```json
{
  "given": "Three platform builds; the bytes of the Windows installer changed after its checksum and detached signature were recorded.",
  "input": {
    "kind": "refused",
    "fault": "tampered"
  },
  "expected": {
    "error": "SignatureInvalid",
    "file": "Agent-M-Bridge-2026.10.0-windows.exe",
    "platform": null,
    "published": 0
  }
}
```

## A detached signature of another key

### Case

```json
{
  "given": "Three platform builds; the macOS disk image carries a detached signature made with a key that is not the publisher's.",
  "input": {
    "kind": "refused",
    "fault": "another-key"
  },
  "expected": {
    "error": "SignatureInvalid",
    "file": "Agent-M-Bridge-2026.10.0-macos.dmg",
    "platform": null,
    "published": 0
  }
}
```

## A macOS build that records no publisher

### Case

```json
{
  "given": "Three platform builds; the macOS build records no publisher, as when the platform's verifier did not accept the signature or the notarisation.",
  "input": {
    "kind": "refused",
    "fault": "no-macos-publisher"
  },
  "expected": {
    "error": "BuildMissing",
    "file": null,
    "platform": "macos",
    "published": 0
  }
}
```

## A Windows build with a blank publisher

### Case

```json
{
  "given": "Three platform builds; the Windows build records a blank publisher name.",
  "input": {
    "kind": "refused",
    "fault": "blank-windows-publisher"
  },
  "expected": {
    "error": "BuildMissing",
    "file": null,
    "platform": "windows",
    "published": 0
  }
}
```

## Intact builds

### Case

```json
{
  "given": "Three intact platform builds and the publisher's key in the environment, as the release workflow holds it.",
  "input": {
    "kind": "signed"
  },
  "expected": {
    "everyFileSigned": true,
    "sumsMatch": true,
    "publisherLines": [
      "Publisher (macOS): Example Lab (ABCDE12345)",
      "Publisher (Windows): Example Lab GmbH"
    ],
    "privateKeyPublished": false
  }
}
```

## Secrets of each platform

### Case

```json
{
  "given": "An environment that lacks exactly one of a platform's secrets, in turn, for each platform; and, as the known positive, the complete secrets of Linux.",
  "input": {
    "kind": "secrets",
    "platforms": [
      "macos",
      "windows",
      "linux"
    ]
  },
  "expected": {
    "macos": [
      "BRIDGE_UPDATE_KEY: SecretMissing BRIDGE_UPDATE_KEY",
      "BRIDGE_MACOS_CERTIFICATE: SecretMissing BRIDGE_MACOS_CERTIFICATE",
      "BRIDGE_MACOS_CERTIFICATE_PASSWORD: SecretMissing BRIDGE_MACOS_CERTIFICATE_PASSWORD",
      "BRIDGE_NOTARY_KEY: SecretMissing BRIDGE_NOTARY_KEY",
      "BRIDGE_NOTARY_KEY_ID: SecretMissing BRIDGE_NOTARY_KEY_ID",
      "BRIDGE_NOTARY_ISSUER: SecretMissing BRIDGE_NOTARY_ISSUER"
    ],
    "windows": [
      "BRIDGE_UPDATE_KEY: SecretMissing BRIDGE_UPDATE_KEY",
      "BRIDGE_WINDOWS_CERTIFICATE: SecretMissing BRIDGE_WINDOWS_CERTIFICATE",
      "BRIDGE_WINDOWS_CERTIFICATE_PASSWORD: SecretMissing BRIDGE_WINDOWS_CERTIFICATE_PASSWORD"
    ],
    "linux": [
      "BRIDGE_UPDATE_KEY: SecretMissing BRIDGE_UPDATE_KEY"
    ],
    "complete": "BuildFailed"
  }
}
```

## A valid update

### Case

```json
{
  "given": "The packaged app over a constructed Electron with the publisher's public key and a newer release whose feed and file the publisher signed.",
  "input": {
    "kind": "updating",
    "feedSignedBy": "publisher",
    "fileSignedBy": "publisher"
  },
  "expected": {
    "offered": "2026.11.0",
    "notes": "Fixes the tunnels.",
    "refusedAtOffer": null,
    "downloadedBeforeClick": false,
    "autoDownload": false,
    "readyAfterDownload": true,
    "refusedAtDownload": null,
    "fileKept": true,
    "installWithoutDecision": "NotConfirmed",
    "installedBeforeConfirm": false,
    "installAfterDecision": "installed",
    "installs": 1
  }
}
```

## A feed signed by another key

### Case

```json
{
  "given": "The packaged app with the publisher's public key and a newer release whose feed another key signed.",
  "input": {
    "kind": "updating",
    "feedSignedBy": "stranger",
    "fileSignedBy": "publisher"
  },
  "expected": {
    "offered": null,
    "notes": null,
    "refusedAtOffer": "The update feed's signature does not hold against the publisher's key, so nothing is offered.",
    "downloadedBeforeClick": false,
    "autoDownload": false
  }
}
```

## A file signed by another key

### Case

```json
{
  "given": "The packaged app with the publisher's public key and a newer release whose feed the publisher signed and whose file another key signed.",
  "input": {
    "kind": "updating",
    "feedSignedBy": "publisher",
    "fileSignedBy": "stranger"
  },
  "expected": {
    "offered": "2026.11.0",
    "notes": "Fixes the tunnels.",
    "refusedAtOffer": null,
    "downloadedBeforeClick": false,
    "autoDownload": false,
    "readyAfterDownload": false,
    "refusedAtDownload": "The downloaded file Agent-M-Bridge-2026.11.0-linux.AppImage is not the publisher's: its signature does not hold. It was deleted.",
    "fileKept": false,
    "installWithoutDecision": "NotConfirmed",
    "installedBeforeConfirm": false,
    "installAfterDecision": "NothingDownloaded",
    "installs": 0
  }
}
```
