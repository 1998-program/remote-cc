<template>
  <span
    class="app-icon"
    :class="[`app-icon--${name}`, { 'app-icon--spin': spin }]"
    :aria-hidden="label ? 'false' : 'true'"
    :aria-label="label || undefined"
    :role="label ? 'img' : undefined"
  >
    <span class="app-icon__mark"></span>
  </span>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  spin: { type: Boolean, default: false },
  label: { type: String, default: '' },
});
</script>

<style scoped>
.app-icon {
  --icon-stroke: 1.7px;
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
  color: currentColor;
  flex: 0 0 auto;
  vertical-align: -0.14em;
  box-sizing: border-box;
}
.app-icon::before,
.app-icon::after,
.app-icon__mark,
.app-icon__mark::before,
.app-icon__mark::after {
  content: '';
  position: absolute;
  box-sizing: border-box;
}

.app-icon--home::before {
  left: 0.18em;
  top: 0.04em;
  width: 0.64em;
  height: 0.64em;
  border-left: var(--icon-stroke) solid currentColor;
  border-top: var(--icon-stroke) solid currentColor;
  transform: rotate(45deg);
  border-radius: 0.06em;
}
.app-icon--home::after {
  left: 0.23em;
  top: 0.49em;
  width: 0.54em;
  height: 0.44em;
  border: var(--icon-stroke) solid currentColor;
  border-top: 0;
  border-radius: 0.08em;
  background: color-mix(in srgb, currentColor 7%, transparent);
}

.app-icon--terminal::before {
  inset: 0.12em 0.04em 0.08em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 0.16em;
}
.app-icon--terminal::after {
  left: 0.23em;
  top: 0.36em;
  width: 0.22em;
  height: 0.22em;
  border-right: var(--icon-stroke) solid currentColor;
  border-bottom: var(--icon-stroke) solid currentColor;
  transform: rotate(-45deg);
}
.app-icon--terminal .app-icon__mark {
  left: 0.58em;
  bottom: 0.26em;
  width: 0.28em;
  height: var(--icon-stroke);
  background: currentColor;
  border-radius: 999px;
}

.app-icon--folder::before,
.app-icon--folder-plus::before {
  left: 0.08em;
  top: 0.2em;
  width: 0.36em;
  height: 0.21em;
  border: var(--icon-stroke) solid currentColor;
  border-bottom: 0;
  border-radius: 0.12em 0.12em 0 0;
}
.app-icon--folder::after,
.app-icon--folder-plus::after {
  left: 0.06em;
  right: 0.05em;
  bottom: 0.11em;
  height: 0.58em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 0.12em;
  background: color-mix(in srgb, currentColor 7%, transparent);
}
.app-icon--folder-plus .app-icon__mark {
  left: 0.39em;
  top: 0.55em;
  width: 0.38em;
  height: var(--icon-stroke);
  background: currentColor;
  border-radius: 999px;
  z-index: 1;
}
.app-icon--folder-plus .app-icon__mark::after {
  left: 0.17em;
  top: -0.17em;
  width: var(--icon-stroke);
  height: 0.38em;
  background: currentColor;
  border-radius: 999px;
}

.app-icon--file::before,
.app-icon--log::before,
.app-icon--empty::before {
  left: 0.18em;
  top: 0.08em;
  width: 0.6em;
  height: 0.84em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 0.1em;
  background: color-mix(in srgb, currentColor 5%, transparent);
}
.app-icon--file::after,
.app-icon--log::after,
.app-icon--empty::after {
  right: 0.22em;
  top: 0.08em;
  width: 0.2em;
  height: 0.2em;
  border-left: var(--icon-stroke) solid currentColor;
  border-bottom: var(--icon-stroke) solid currentColor;
}
.app-icon--log .app-icon__mark {
  left: 0.31em;
  top: 0.39em;
  width: 0.36em;
  height: var(--icon-stroke);
  background: currentColor;
  border-radius: 999px;
  box-shadow: 0 0.16em 0 currentColor, 0 0.32em 0 currentColor;
}
.app-icon--empty {
  opacity: 0.65;
}

.app-icon--settings::before {
  left: 0.08em;
  top: 0.23em;
  width: 0.84em;
  height: var(--icon-stroke);
  background: currentColor;
  border-radius: 999px;
  box-shadow: 0 0.26em 0 currentColor, 0 0.52em 0 currentColor;
}
.app-icon--settings::after {
  left: 0.61em;
  top: 0.16em;
  width: 0.16em;
  height: 0.16em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 999px;
  background: var(--bg2, transparent);
  box-shadow:
    -0.36em 0.26em 0 calc(var(--icon-stroke) * -0.25) var(--bg2, transparent),
    -0.36em 0.26em 0 0 currentColor,
    0.16em 0.52em 0 calc(var(--icon-stroke) * -0.25) var(--bg2, transparent),
    0.16em 0.52em 0 0 currentColor;
}

.app-icon--help::before {
  inset: 0.08em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 999px;
}
.app-icon--help::after {
  content: '?';
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72em;
  font-weight: 800;
  line-height: 1;
}

.app-icon--plus::before,
.app-icon--minus::before {
  left: 0.2em;
  top: 0.48em;
  width: 0.6em;
  height: var(--icon-stroke);
  background: currentColor;
  border-radius: 999px;
}
.app-icon--plus::after {
  left: 0.48em;
  top: 0.2em;
  width: var(--icon-stroke);
  height: 0.6em;
  background: currentColor;
  border-radius: 999px;
}

.app-icon--close::before,
.app-icon--close::after {
  left: 0.19em;
  top: 0.48em;
  width: 0.62em;
  height: var(--icon-stroke);
  background: currentColor;
  border-radius: 999px;
}
.app-icon--close::before { transform: rotate(45deg); }
.app-icon--close::after { transform: rotate(-45deg); }

.app-icon--check::before {
  left: 0.22em;
  top: 0.34em;
  width: 0.55em;
  height: 0.31em;
  border-left: var(--icon-stroke) solid currentColor;
  border-bottom: var(--icon-stroke) solid currentColor;
  transform: rotate(-45deg);
}

.app-icon--trash::before {
  left: 0.25em;
  top: 0.18em;
  width: 0.5em;
  height: var(--icon-stroke);
  background: currentColor;
  border-radius: 999px;
  box-shadow: 0 -0.09em 0 -0.02em currentColor;
}
.app-icon--trash::after {
  left: 0.28em;
  top: 0.32em;
  width: 0.44em;
  height: 0.56em;
  border: var(--icon-stroke) solid currentColor;
  border-top-width: var(--icon-stroke);
  border-radius: 0.08em;
}
.app-icon--trash .app-icon__mark {
  left: 0.39em;
  top: 0.43em;
  width: var(--icon-stroke);
  height: 0.34em;
  background: currentColor;
  border-radius: 999px;
  box-shadow: 0.18em 0 0 currentColor;
}

.app-icon--stop::before {
  left: 0.24em;
  top: 0.24em;
  width: 0.52em;
  height: 0.52em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 0.1em;
  background: color-mix(in srgb, currentColor 18%, transparent);
}

.app-icon--copy::before {
  left: 0.18em;
  top: 0.18em;
  width: 0.48em;
  height: 0.56em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 0.08em;
  opacity: 0.55;
}
.app-icon--copy::after {
  left: 0.34em;
  top: 0.3em;
  width: 0.48em;
  height: 0.56em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 0.08em;
  background: var(--bg2, transparent);
}

.app-icon--paste::before {
  left: 0.24em;
  top: 0.24em;
  width: 0.52em;
  height: 0.66em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 0.09em;
}
.app-icon--paste::after {
  left: 0.34em;
  top: 0.09em;
  width: 0.32em;
  height: 0.22em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 0.08em;
  background: var(--bg2, transparent);
}

.app-icon--select-all::before {
  inset: 0.12em;
  border: var(--icon-stroke) dashed currentColor;
  border-radius: 0.1em;
}
.app-icon--select-all::after {
  inset: 0.29em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 0.08em;
  background: color-mix(in srgb, currentColor 6%, transparent);
}

.app-icon--clear::before {
  inset: 0.13em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 999px;
}
.app-icon--clear::after {
  left: 0.18em;
  top: 0.48em;
  width: 0.64em;
  height: var(--icon-stroke);
  background: currentColor;
  border-radius: 999px;
  transform: rotate(-35deg);
}

.app-icon--download::before,
.app-icon--upload::before {
  left: 0.49em;
  top: 0.17em;
  width: var(--icon-stroke);
  height: 0.46em;
  background: currentColor;
  border-radius: 999px;
}
.app-icon--download::after,
.app-icon--upload::after {
  left: 0.2em;
  bottom: 0.18em;
  width: 0.6em;
  height: 0.24em;
  border-left: var(--icon-stroke) solid currentColor;
  border-right: var(--icon-stroke) solid currentColor;
  border-bottom: var(--icon-stroke) solid currentColor;
  border-radius: 0 0 0.1em 0.1em;
}
.app-icon--download .app-icon__mark,
.app-icon--upload .app-icon__mark {
  left: 0.36em;
  width: 0.28em;
  height: 0.28em;
  border-right: var(--icon-stroke) solid currentColor;
  border-bottom: var(--icon-stroke) solid currentColor;
}
.app-icon--download .app-icon__mark {
  top: 0.39em;
  transform: rotate(45deg);
}
.app-icon--upload::before {
  top: 0.34em;
}
.app-icon--upload .app-icon__mark {
  top: 0.19em;
  transform: rotate(-135deg);
}

.app-icon--parent::before {
  left: 0.22em;
  top: 0.32em;
  width: 0.58em;
  height: 0.42em;
  border-left: var(--icon-stroke) solid currentColor;
  border-bottom: var(--icon-stroke) solid currentColor;
  border-radius: 0 0 0 0.12em;
}
.app-icon--parent::after {
  left: 0.2em;
  top: 0.24em;
  width: 0.28em;
  height: 0.28em;
  border-left: var(--icon-stroke) solid currentColor;
  border-top: var(--icon-stroke) solid currentColor;
  transform: rotate(-45deg);
}

.app-icon--fullscreen::before {
  left: 0.13em;
  top: 0.13em;
  width: 0.28em;
  height: 0.28em;
  border-left: var(--icon-stroke) solid currentColor;
  border-top: var(--icon-stroke) solid currentColor;
  box-shadow: 0.47em 0 0 -0.02em currentColor;
}
.app-icon--fullscreen::after {
  right: 0.13em;
  bottom: 0.13em;
  width: 0.28em;
  height: 0.28em;
  border-right: var(--icon-stroke) solid currentColor;
  border-bottom: var(--icon-stroke) solid currentColor;
}
.app-icon--fullscreen .app-icon__mark::before {
  right: 0.13em;
  top: 0.13em;
  width: 0.28em;
  height: 0.28em;
  border-right: var(--icon-stroke) solid currentColor;
  border-top: var(--icon-stroke) solid currentColor;
}
.app-icon--fullscreen .app-icon__mark::after {
  left: 0.13em;
  bottom: 0.13em;
  width: 0.28em;
  height: 0.28em;
  border-left: var(--icon-stroke) solid currentColor;
  border-bottom: var(--icon-stroke) solid currentColor;
}

.app-icon--chevron::before {
  left: 0.34em;
  top: 0.27em;
  width: 0.36em;
  height: 0.36em;
  border-right: var(--icon-stroke) solid currentColor;
  border-bottom: var(--icon-stroke) solid currentColor;
  transform: rotate(45deg);
}

.app-icon--users::before {
  left: 0.2em;
  top: 0.18em;
  width: 0.3em;
  height: 0.3em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 999px;
}
.app-icon--users::after {
  left: 0.11em;
  top: 0.6em;
  width: 0.48em;
  height: 0.25em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 0.24em 0.24em 0 0;
}
.app-icon--users .app-icon__mark::before {
  left: 0.58em;
  top: 0.26em;
  width: 0.22em;
  height: 0.22em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 999px;
  opacity: 0.75;
}
.app-icon--users .app-icon__mark::after {
  left: 0.54em;
  top: 0.64em;
  width: 0.34em;
  height: 0.2em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 0.2em 0.2em 0 0;
  opacity: 0.75;
}

.app-icon--spinner::before {
  inset: 0.14em;
  border: var(--icon-stroke) solid currentColor;
  border-top-color: transparent;
  border-radius: 999px;
}
.app-icon--refresh::before {
  inset: 0.14em;
  border: var(--icon-stroke) solid currentColor;
  border-left-color: transparent;
  border-radius: 999px;
}
.app-icon--refresh::after {
  right: 0.14em;
  top: 0.14em;
  width: 0.24em;
  height: 0.24em;
  border-right: var(--icon-stroke) solid currentColor;
  border-top: var(--icon-stroke) solid currentColor;
  transform: rotate(8deg);
}

.app-icon--play::before {
  left: 0.34em;
  top: 0.21em;
  width: 0;
  height: 0;
  border-top: 0.29em solid transparent;
  border-bottom: 0.29em solid transparent;
  border-left: 0.42em solid currentColor;
}

.app-icon--image::before {
  inset: 0.14em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 0.12em;
}
.app-icon--image::after {
  left: 0.25em;
  bottom: 0.24em;
  width: 0.56em;
  height: 0.28em;
  border-left: var(--icon-stroke) solid currentColor;
  border-bottom: var(--icon-stroke) solid currentColor;
  transform: skewX(-25deg);
}
.app-icon--image .app-icon__mark {
  right: 0.25em;
  top: 0.25em;
  width: 0.14em;
  height: 0.14em;
  border: var(--icon-stroke) solid currentColor;
  border-radius: 999px;
}

.app-icon--spin {
  animation: app-icon-spin 0.9s linear infinite;
}
@keyframes app-icon-spin {
  to { transform: rotate(360deg); }
}
</style>
