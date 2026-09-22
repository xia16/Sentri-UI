# Markers

Figma nodes: `2567:8730`, `2567:8778`, `2567:8825`, `2567:8917`.

## Intent

A marker is a quick visual instruction applied to the physical animal, such as “red line on left shoulder.” It is not a health diagnosis and should not force the user through the disease catalogue.

## Interaction

- Entry: **Actions → General → Add marker**.
- The form asks for the mark and its meaning in one plain-language field.
- An existing active marker is shown above the editor and can be replaced.
- Save is disabled until text is entered.
- Saving creates a timestamped sow-history event and returns to Actions.

## Data and rules

Store the description, author, timestamp, and active state. Marker colour/shape may remain free text until the farm has a controlled vocabulary. A future delete action should close the active marker while preserving history.
