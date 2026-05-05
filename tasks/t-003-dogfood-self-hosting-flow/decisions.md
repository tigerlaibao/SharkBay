# Decisions

| Date | Decision | Context | Alternatives |
| --- | --- | --- | --- |
| 2026-05-05 | Narrowly expand the t-003 contract to include Electron preload files. | Dogfooding found the app could render but could not use `window.sharkBay`, blocking any real self-hosting flow. The fix only changed the preload module extension and BrowserWindow preload path; it did not add IPC authority or broaden filesystem access. | Stop immediately and start a separate task; leave t-003 unable to dogfood the running app; add broader IPC changes. |
