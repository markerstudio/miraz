# Country-page artwork

Drop the six engraved landmark images here, named by country id:

    eastasia.png   (pagoda)
    levant.png     (Dome of the Rock)
    greece.png     (Parthenon)
    usa.png        (Statue of Liberty)
    italy.png      (Colosseum)
    morocco.png    (Koutoubia minaret)

`.png`, `.jpg`, `.jpeg` or `.webp` all work. Any file present here is
picked up automatically at build time and replaces the built-in SVG
engraving for that country (multiply-blended onto the page, fading
toward the page head). Delete a file to fall back to the SVG.

Note: `<id>.ink.webp` files are preprocessed "ink plates" (white removed,
ink recolored to charcoal, top fade baked into the alpha channel) that
render with cheap plain compositing. Raw white-background drops still work
via live multiply blending, but for best performance ask Claude to bake
them into ink plates.
