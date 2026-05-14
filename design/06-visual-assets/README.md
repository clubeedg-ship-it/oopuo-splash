# Logo SVG Assets

The OOPUO logo is a network ring (connected nodes/edges). Two versions needed:

## Files
- `oopuo-logo-original.svg` — Black fill (#000000) for light backgrounds (nav, light sections)
- `oopuo-logo-light.svg` — Off-white fill (#EAEDF3) for dark backgrounds (hero, footer)

Both files are identical except for the fill color attribute.

## How to generate the light version from the original
```bash
sed 's/fill="#000000"/fill="#EAEDF3"/g' oopuo-logo-original.svg > oopuo-logo-light.svg
```

## SVG Details
- viewBox: 0 0 1024 544
- Contains multiple path elements forming the network ring design
- 40KB per file (complex path data)

## Usage in Nav
- Mark height: 28px desktop, 24px mobile
- Paired with OOPUO wordmark (font-display 700 20px)
- Both link to /

## Note
The original SVG was uploaded by the client. It should be committed from the local clone at `/Users/ottogen/oopuo-splash/` or from the design scaffolding zip.
The file is also available in Claude's container at `/mnt/user-data/uploads/oopuo-logo.svg`.
