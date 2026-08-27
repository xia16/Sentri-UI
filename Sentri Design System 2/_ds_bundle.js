/* @ds-bundle: {"format":4,"namespace":"SentriDesignSystem_44ba05","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Input","sourcePath":"components/inputs/Input.jsx"},{"name":"Select","sourcePath":"components/inputs/Select.jsx"},{"name":"Stepper","sourcePath":"components/inputs/Stepper.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"},{"name":"TopBarAction","sourcePath":"components/navigation/TopBar.jsx"},{"name":"ActionBar","sourcePath":"components/overlays/ActionBar.jsx"},{"name":"Sheet","sourcePath":"components/overlays/Sheet.jsx"},{"name":"ProgressBar","sourcePath":"components/progress/ProgressBar.jsx"},{"name":"Stat","sourcePath":"components/progress/Stat.jsx"},{"name":"AnimalRow","sourcePath":"components/records/AnimalRow.jsx"},{"name":"LocationRow","sourcePath":"components/records/LocationRow.jsx"},{"name":"TaskCard","sourcePath":"components/records/TaskCard.jsx"},{"name":"Checkbox","sourcePath":"components/selection/Checkbox.jsx"},{"name":"SegmentedControl","sourcePath":"components/selection/SegmentedControl.jsx"},{"name":"Switch","sourcePath":"components/selection/Switch.jsx"},{"name":"CountPill","sourcePath":"components/status/CountPill.jsx"},{"name":"StatusBadge","sourcePath":"components/status/StatusBadge.jsx"},{"name":"SyncPill","sourcePath":"components/status/SyncPill.jsx"},{"name":"Tag","sourcePath":"components/status/Tag.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"55187e5fb98e","components/buttons/IconButton.jsx":"116f8045647a","components/core/Icon.jsx":"bdbbb6e4c082","components/feedback/Toast.jsx":"7b5c7beba8a6","components/inputs/Input.jsx":"0167cf89bb98","components/inputs/Select.jsx":"49000671d3b2","components/inputs/Stepper.jsx":"d88772cfba06","components/navigation/BottomNav.jsx":"c48cd0dfa5a1","components/navigation/Tabs.jsx":"639f5b1b9500","components/navigation/TopBar.jsx":"df43bdee862e","components/overlays/ActionBar.jsx":"787ef41860a6","components/overlays/Sheet.jsx":"b9aa1a764696","components/progress/ProgressBar.jsx":"0bc7368f315b","components/progress/Stat.jsx":"f93b0d011edf","components/records/AnimalRow.jsx":"d4626ecfdea2","components/records/LocationRow.jsx":"d64a0dcf55b0","components/records/TaskCard.jsx":"6be0dc277a3e","components/selection/Checkbox.jsx":"f0bf517d3d13","components/selection/SegmentedControl.jsx":"470fc6c6fbe3","components/selection/Switch.jsx":"6570327a4740","components/status/CountPill.jsx":"a53c101e3a9b","components/status/StatusBadge.jsx":"8e45648b2cd7","components/status/SyncPill.jsx":"89de4749e9b8","components/status/Tag.jsx":"1405e3db3d75","ui_kits/sentri-mobile/doc-page.js":"371bab66f42d","ui_kits/sentri-mobile/screens/AnimalsScreen.jsx":"3cbc4fc9cc90","ui_kits/sentri-mobile/screens/TodayScreen.jsx":"857c445c7fac","ui_kits/sentri-mobile/screens/UnitScreen.jsx":"0f49eaf40726"},"inlinedExternals":[],"unexposedExports":[{"name":"statusStyles","sourcePath":"components/status/StatusBadge.jsx"}]} */

(() => {

const __ds_ns = (window.SentriDesignSystem_44ba05 = window.SentriDesignSystem_44ba05 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Icon.jsx
try { (() => {
const iconPascal = n => n.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  color,
  style
}) {
  const [, tick] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    if (window.lucide) return;
    const t = setInterval(() => {
      if (window.lucide) {
        clearInterval(t);
        tick();
      }
    }, 60);
    return () => clearInterval(t);
  }, []);
  const lib = window.lucide && (window.lucide.icons || window.lucide);
  const node = lib && (lib[iconPascal(name)] || lib[name]);
  if (!Array.isArray(node)) return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      flexShrink: 0,
      ...style
    },
    "aria-hidden": "true"
  });
  // Supports both lucide node shapes: ["svg",attrs,[children]] (UMD) and [[tag,attrs],...] (icon-node list)
  const kids = node[0] === 'svg' ? node[2] || [] : node;
  const renderNode = (n, i) => Array.isArray(n) ? React.createElement(n[0], {
    ...n[1],
    key: i
  }, Array.isArray(n[2]) ? n[2].map(renderNode) : undefined) : null;
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color || 'currentColor',
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flexShrink: 0,
      ...style
    },
    "aria-hidden": "true"
  }, kids.map(renderNode));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
const btnVariants = {
  primary: {
    bg: 'var(--olive-800)',
    ink: 'var(--ink-on-brand)',
    border: 'transparent',
    hover: 'var(--olive-900)'
  },
  secondary: {
    bg: 'var(--surface-sunken)',
    ink: 'var(--ink-1)',
    border: 'transparent',
    hover: 'var(--neutral-200)'
  },
  ghost: {
    bg: 'transparent',
    ink: 'var(--olive-700)',
    border: 'transparent',
    hover: 'var(--olive-50)'
  },
  danger: {
    bg: 'var(--red-600)',
    ink: '#fff',
    border: 'transparent',
    hover: 'var(--red-700)'
  }
};
const btnSizes = {
  sm: {
    h: 'var(--control-h-sm)',
    pad: '0 12px',
    fs: 'var(--fs-label)',
    icon: 16
  },
  md: {
    h: 'var(--control-h)',
    pad: '0 20px',
    fs: 'var(--fs-body)',
    icon: 20
  },
  lg: {
    h: 'var(--control-h-lg)',
    pad: '0 24px',
    fs: 'var(--fs-body-lg)',
    icon: 22
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  disabled = false,
  full = false,
  onClick,
  style
}) {
  const v = btnVariants[variant] || btnVariants.primary,
    s = btnSizes[size] || btnSizes.md;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: full ? 'flex' : 'inline-flex',
      width: full ? '100%' : undefined,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: s.h,
      padding: s.pad,
      border: '1px solid ' + v.border,
      borderRadius: 'var(--radius-full)',
      background: disabled ? 'var(--surface-sunken)' : hover ? v.hover : v.bg,
      color: disabled ? 'var(--ink-disabled)' : v.ink,
      font: 'var(--fw-semibold) ' + s.fs + '/1 var(--font-body)',
      cursor: disabled ? 'default' : 'pointer',
      transform: press && !disabled ? 'scale(.98)' : 'none',
      transition: 'background var(--dur-fast) var(--ease-out),transform var(--dur-fast) var(--ease-out)',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon
  }), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
const iconBtnVariants = {
  primary: {
    bg: 'var(--olive-800)',
    ink: '#fff',
    border: 'transparent',
    hover: 'var(--olive-900)'
  },
  secondary: {
    bg: 'var(--surface-sunken)',
    ink: 'var(--ink-1)',
    border: 'transparent',
    hover: 'var(--neutral-200)'
  },
  ghost: {
    bg: 'transparent',
    ink: 'var(--ink-2)',
    border: 'transparent',
    hover: 'var(--surface-sunken)'
  }
};
function IconButton({
  icon,
  label,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  onClick,
  style
}) {
  const v = iconBtnVariants[variant] || iconBtnVariants.secondary;
  const d = size === 'sm' ? 36 : 48;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    "aria-label": label,
    title: label,
    onClick: onClick,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: d,
      height: d,
      flexShrink: 0,
      border: '1px solid ' + v.border,
      borderRadius: 'var(--radius-full)',
      background: disabled ? 'var(--surface-sunken)' : hover ? v.hover : v.bg,
      color: disabled ? 'var(--ink-disabled)' : v.ink,
      cursor: disabled ? 'default' : 'pointer',
      transform: press && !disabled ? 'scale(.96)' : 'none',
      transition: 'background var(--dur-fast) var(--ease-out),transform var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'sm' ? 18 : 22
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function Toast({
  message,
  tone = 'neutral',
  icon,
  action,
  onAction,
  style
}) {
  const tones = {
    neutral: {
      bg: 'var(--neutral-900)',
      ink: '#fff',
      defIcon: 'info'
    },
    success: {
      bg: 'var(--neutral-900)',
      ink: '#fff',
      defIcon: 'check'
    },
    error: {
      bg: 'var(--red-700)',
      ink: '#fff',
      defIcon: 'alert-triangle'
    }
  };
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 16px',
      borderRadius: 'var(--radius-lg)',
      background: t.bg,
      color: t.ink,
      boxShadow: 'var(--shadow-raised)',
      font: 'var(--text-body)',
      maxWidth: 420,
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon || t.defIcon,
    size: 20,
    color: tone === 'success' ? 'var(--green-100)' : undefined
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, message), action && /*#__PURE__*/React.createElement("button", {
    onClick: onAction,
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--amber-500)',
      font: 'var(--fw-semibold) var(--fs-label)/1 var(--font-body)',
      cursor: 'pointer',
      padding: '8px 4px',
      whiteSpace: 'nowrap'
    }
  }, action));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/inputs/Input.jsx
try { (() => {
function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  suffix,
  error,
  hint,
  disabled = false,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-label)',
      color: 'var(--ink-2)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 'var(--control-h)',
      padding: '0 14px',
      background: disabled ? 'var(--neutral-100)' : focus ? 'var(--surface-card)' : 'var(--surface-sunken)',
      border: '1.5px solid ' + (error ? 'var(--red-600)' : focus ? 'var(--focus)' : 'transparent'),
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? '0 0 0 3px var(--olive-100)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)'
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20,
    color: "var(--ink-3)"
  }), /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      font: 'var(--text-body)',
      color: disabled ? 'var(--ink-disabled)' : 'var(--ink-1)'
    }
  }), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--ink-3)',
      flexShrink: 0
    }
  }, suffix)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-caption)',
      color: error ? 'var(--red-700)' : 'var(--ink-3)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/Input.jsx", error: String((e && e.message) || e) }); }

// components/inputs/Select.jsx
try { (() => {
function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-label)',
      color: 'var(--ink-2)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: value ?? '',
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      height: 'var(--control-h)',
      padding: '0 40px 0 14px',
      appearance: 'none',
      WebkitAppearance: 'none',
      background: disabled ? 'var(--neutral-100)' : focus ? 'var(--surface-card)' : 'var(--surface-sunken)',
      border: '1.5px solid ' + (focus ? 'var(--focus)' : 'transparent'),
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? '0 0 0 3px var(--olive-100)' : 'none',
      font: 'var(--text-body)',
      color: value ? 'var(--ink-1)' : 'var(--ink-3)',
      cursor: disabled ? 'default' : 'pointer'
    }
  }, placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => {
    const v = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v.value,
      value: v.value
    }, v.label);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'var(--ink-3)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 20
  }))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/Select.jsx", error: String((e && e.message) || e) }); }

// components/inputs/Stepper.jsx
try { (() => {
function StepBtn({
  icon,
  onClick,
  disabled
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    "aria-label": icon === 'minus' ? 'Decrease' : 'Increase',
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: 'var(--control-h)',
      height: 'var(--control-h)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: 'var(--radius-full)',
      background: disabled ? 'var(--neutral-100)' : hover ? 'var(--neutral-200)' : 'var(--surface-sunken)',
      color: disabled ? 'var(--ink-disabled)' : 'var(--ink-1)',
      cursor: disabled ? 'default' : 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22
  }));
}
function Stepper({
  label,
  value = 0,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  unit,
  style
}) {
  const set = v => onChange && onChange(Math.min(max, Math.max(min, v)));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-label)',
      color: 'var(--ink-2)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(StepBtn, {
    icon: "minus",
    onClick: () => set(value - step),
    disabled: value <= min
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 72,
      textAlign: 'center',
      font: 'var(--fw-bold) var(--fs-heading)/1 var(--font-display)',
      color: 'var(--ink-1)'
    }
  }, value, unit && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--ink-3)',
      marginLeft: 4
    }
  }, unit)), /*#__PURE__*/React.createElement(StepBtn, {
    icon: "plus",
    onClick: () => set(value + step),
    disabled: value >= max
  })));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
function BottomNav({
  items = [],
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: 'var(--surface-card)',
      boxShadow: '0 -4px 16px rgba(23,25,22,.06)',
      padding: '6px 8px 10px',
      ...style
    }
  }, items.map(it => {
    const active = it.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      onClick: () => onChange && onChange(it.value),
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: '4px 0',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: active ? 'var(--olive-900)' : 'var(--ink-3)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 32,
        borderRadius: 'var(--radius-full)',
        background: active ? 'var(--olive-100)' : 'transparent',
        transition: 'background var(--dur-med) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 22,
      strokeWidth: active ? 2.4 : 2
    }), it.badge != null && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: -3,
        right: 6,
        minWidth: 16,
        height: 16,
        padding: '0 4px',
        boxSizing: 'border-box',
        borderRadius: 'var(--radius-full)',
        background: 'var(--status-overdue)',
        color: '#fff',
        font: 'var(--fw-bold) 10px/16px var(--font-display)',
        textAlign: 'center'
      }
    }, it.badge)), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--fw-' + (active ? 'bold' : 'medium') + ') 11px/1 var(--font-body)'
      }
    }, it.label));
  }));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  tabs = [],
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      ...style
    }
  }, tabs.map(t => {
    const tab = typeof t === 'string' ? {
      value: t,
      label: t
    } : t;
    const active = tab.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.value,
      onClick: () => onChange && onChange(tab.value),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '9px 14px',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        background: active ? 'var(--neutral-900)' : 'var(--surface-sunken)',
        color: active ? '#fff' : 'var(--ink-2)',
        font: 'var(--fw-semibold) var(--fs-label)/1 var(--font-body)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background var(--dur-fast) var(--ease-out)'
      }
    }, tab.label, tab.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        opacity: active ? .7 : .55
      }
    }, tab.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function TopBar({
  title,
  subtitle,
  onBack,
  actions,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      minHeight: 64,
      padding: '10px 16px',
      background: 'var(--bg-app)',
      color: 'var(--ink-1)',
      ...style
    }
  }, onBack && /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    "aria-label": "Back",
    style: {
      width: 44,
      height: 44,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      background: 'var(--surface-card)',
      color: 'var(--ink-1)',
      cursor: 'pointer',
      borderRadius: 'var(--radius-full)',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-left",
    size: 24
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-extrabold) 20px/1.2 var(--font-display)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--ink-3)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      marginTop: 1
    }
  }, subtitle)), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, actions));
}
function TopBarAction({
  icon,
  label,
  onClick,
  badge
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    "aria-label": label,
    title: label,
    style: {
      position: 'relative',
      width: 44,
      height: 44,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      background: 'var(--surface-card)',
      color: 'var(--ink-1)',
      cursor: 'pointer',
      borderRadius: 'var(--radius-full)',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22
  }), badge != null && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 18,
      height: 18,
      padding: '0 5px',
      boxSizing: 'border-box',
      borderRadius: 'var(--radius-full)',
      background: 'var(--status-overdue)',
      color: '#fff',
      font: 'var(--fw-bold) 11px/18px var(--font-display)',
      textAlign: 'center'
    }
  }, badge));
}
Object.assign(__ds_scope, { TopBar, TopBarAction });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// components/overlays/ActionBar.jsx
try { (() => {
function ActionBar({
  message,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      background: 'var(--surface-card)',
      boxShadow: 'var(--shadow-sheet)',
      ...style
    }
  }, message && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: 'var(--fw-semibold) var(--fs-body)/1.3 var(--font-body)',
      color: 'var(--ink-1)'
    }
  }, message), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flex: message ? undefined : 1
    }
  }, children));
}
Object.assign(__ds_scope, { ActionBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/ActionBar.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Sheet.jsx
try { (() => {
function Sheet({
  open = false,
  onClose,
  title,
  children,
  footer,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(28,27,24,.4)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      maxWidth: 480,
      maxHeight: '85%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-card)',
      borderRadius: '28px 28px 0 0',
      boxShadow: 'var(--shadow-sheet)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 4,
      flexShrink: 0,
      borderRadius: 'var(--radius-full)',
      background: 'var(--neutral-200)',
      margin: '10px auto 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 8px 0 20px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: 'var(--text-title)'
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      width: 48,
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      background: 'transparent',
      color: 'var(--ink-2)',
      cursor: 'pointer',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 24
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: 20
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 24px',
      display: 'flex',
      gap: 12
    }
  }, footer)));
}
Object.assign(__ds_scope, { Sheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Sheet.jsx", error: String((e && e.message) || e) }); }

// components/progress/ProgressBar.jsx
try { (() => {
function ProgressBar({
  done = 0,
  total = 0,
  label,
  showCount = true,
  style
}) {
  const pct = total > 0 ? Math.min(100, done / total * 100) : 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, (label || showCount) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 12
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-label)',
      color: 'var(--ink-2)'
    }
  }, label), showCount && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--fs-label)/1.2 var(--font-display)',
      color: 'var(--ink-1)',
      whiteSpace: 'nowrap'
    }
  }, done, " of ", total)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      borderRadius: 'var(--radius-full)',
      background: 'var(--surface-sunken)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + '%',
      height: '100%',
      borderRadius: 'var(--radius-full)',
      background: 'var(--status-done)',
      transition: 'width var(--dur-med) var(--ease-out)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/progress/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/progress/Stat.jsx
try { (() => {
function Stat({
  value,
  label,
  tone = 'default',
  suffix,
  style
}) {
  const inks = {
    default: 'var(--ink-1)',
    overdue: 'var(--status-overdue)',
    due: 'var(--amber-600)',
    done: 'var(--status-done)',
    muted: 'var(--ink-3)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-count)',
      color: inks[tone] || inks.default,
      whiteSpace: 'nowrap'
    }
  }, value == null ? '—' : value, suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--fs-title)/1 var(--font-display)',
      color: 'var(--ink-3)'
    }
  }, " ", suffix)), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-semibold) var(--fs-caption)/1.2 var(--font-body)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--ink-3)',
      whiteSpace: 'nowrap'
    }
  }, label));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/progress/Stat.jsx", error: String((e && e.message) || e) }); }

// components/selection/Checkbox.jsx
try { (() => {
function Checkbox({
  checked = false,
  onChange,
  label,
  sublabel,
  disabled = false,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minHeight: 'var(--touch-min)',
      cursor: disabled ? 'default' : 'pointer',
      userSelect: 'none',
      ...style
    },
    onClick: e => {
      e.preventDefault();
      !disabled && onChange && onChange(!checked);
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 26,
      height: 26,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      border: '2px solid ' + (checked ? 'var(--olive-800)' : 'var(--neutral-300)'),
      background: checked ? 'var(--olive-800)' : 'var(--surface-card)',
      opacity: disabled ? .5 : 1,
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, checked && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 18,
    color: "#fff",
    strokeWidth: 3
  })), (label || sublabel) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body)',
      color: disabled ? 'var(--ink-disabled)' : 'var(--ink-1)'
    }
  }, label), sublabel && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--ink-3)'
    }
  }, sublabel)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/selection/SegmentedControl.jsx
try { (() => {
function SegmentedControl({
  options = [],
  value,
  onChange,
  full = true,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: full ? 'flex' : 'inline-flex',
      padding: 4,
      gap: 2,
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-full)',
      ...style
    }
  }, options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    const active = opt.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.value,
      onClick: () => onChange && onChange(opt.value),
      style: {
        flex: full ? 1 : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 40,
        padding: '0 16px',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        background: active ? 'var(--surface-card)' : 'transparent',
        boxShadow: active ? 'var(--shadow-card)' : 'none',
        color: active ? 'var(--ink-1)' : 'var(--ink-3)',
        font: 'var(--fw-semibold) var(--fs-label)/1 var(--font-body)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background var(--dur-fast) var(--ease-out)'
      }
    }, opt.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: opt.icon,
      size: 18
    }), opt.label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/selection/Switch.jsx
try { (() => {
function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minHeight: 'var(--touch-min)',
      cursor: disabled ? 'default' : 'pointer',
      userSelect: 'none',
      ...style
    },
    onClick: e => {
      e.preventDefault();
      !disabled && onChange && onChange(!checked);
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 32,
      flexShrink: 0,
      borderRadius: 'var(--radius-full)',
      padding: 3,
      boxSizing: 'border-box',
      background: checked ? 'var(--olive-800)' : 'var(--neutral-300)',
      opacity: disabled ? .5 : 1,
      transition: 'background var(--dur-med) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: 26,
      height: 26,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--shadow-card)',
      transform: checked ? 'translateX(20px)' : 'none',
      transition: 'transform var(--dur-med) var(--ease-out)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body)',
      color: disabled ? 'var(--ink-disabled)' : 'var(--ink-1)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/Switch.jsx", error: String((e && e.message) || e) }); }

// components/status/StatusBadge.jsx
try { (() => {
const statusStyles = {
  overdue: {
    bg: 'var(--status-overdue)',
    ink: 'var(--status-overdue-ink)',
    border: 'transparent',
    icon: 'alert-triangle',
    label: 'Overdue'
  },
  due: {
    bg: 'var(--status-due)',
    ink: 'var(--status-due-ink)',
    border: 'transparent',
    icon: 'clock',
    label: 'Due now'
  },
  upcoming: {
    bg: 'var(--status-upcoming-bg)',
    ink: 'var(--status-upcoming-text)',
    border: 'var(--blue-100)',
    icon: 'calendar-clock',
    label: 'Upcoming'
  },
  done: {
    bg: 'var(--status-done-bg)',
    ink: 'var(--status-done-text)',
    border: 'var(--green-100)',
    icon: 'check',
    label: 'Done'
  },
  blocked: {
    bg: 'var(--status-blocked-bg)',
    ink: 'var(--status-blocked-text)',
    border: 'transparent',
    icon: 'octagon-pause',
    label: 'Blocked'
  },
  none: {
    bg: 'var(--paper)',
    ink: 'var(--ink-3)',
    border: 'var(--neutral-300)',
    dashed: true,
    icon: 'help-circle',
    label: 'No status'
  }
};
function StatusBadge({
  status = 'due',
  children,
  icon = true,
  size = 'md',
  style
}) {
  const s = statusStyles[status] || statusStyles.due;
  const sm = size === 'sm';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: sm ? 4 : 6,
      padding: sm ? '3px 8px' : '5px 12px',
      borderRadius: 'var(--radius-full)',
      border: '1px ' + (s.dashed ? 'dashed' : 'solid') + ' ' + s.border,
      background: s.bg,
      color: s.ink,
      font: 'var(--fw-semibold) ' + (sm ? '11px' : 'var(--fs-caption)') + '/1.2 var(--font-body)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: s.icon,
    size: sm ? 12 : 14,
    strokeWidth: 2.5
  }), children || s.label);
}
Object.assign(__ds_scope, { statusStyles, StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/status/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/records/AnimalRow.jsx
try { (() => {
function AnimalRow({
  id,
  pen,
  meta,
  status,
  statusLabel,
  note,
  selected,
  onSelect,
  onClick,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const clickable = onSelect || onClick;
  return /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (onSelect) onSelect(!selected);else if (onClick) onClick();
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    role: clickable ? 'button' : undefined,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minHeight: 'var(--touch-min)',
      padding: '8px 16px',
      background: selected ? 'var(--olive-50)' : hover && clickable ? 'var(--paper)' : 'var(--surface-card)',
      cursor: clickable ? 'pointer' : 'default',
      transition: 'background var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, onSelect && /*#__PURE__*/React.createElement(__ds_scope.Checkbox, {
    checked: !!selected,
    onChange: v => onSelect(v),
    style: {
      minHeight: 0,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-id)',
      color: 'var(--ink-1)'
    }
  }, id), pen && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-medium) var(--fs-caption)/1.2 var(--font-mono)',
      color: 'var(--ink-3)'
    }
  }, pen)), (meta || note) && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: note ? 'var(--amber-800)' : 'var(--ink-3)',
      marginTop: 2,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, note || meta)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      flexShrink: 0
    }
  }, status && /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
    status: status,
    size: "sm",
    icon: false
  }, statusLabel), onClick && !onSelect && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--ink-3)"
  })));
}
Object.assign(__ds_scope, { AnimalRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/records/AnimalRow.jsx", error: String((e && e.message) || e) }); }

// components/records/TaskCard.jsx
try { (() => {
function TaskCard({
  title,
  icon = 'clipboard-list',
  overdue = 0,
  due = 0,
  locations,
  progress,
  nextUp,
  onClick,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const hasNow = (overdue || 0) + (due || 0) > 0;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    role: onClick ? 'button' : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: 16,
      background: 'var(--surface-card)',
      border: 'none',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background var(--dur-fast) var(--ease-out)',
      ...(hover && onClick ? {
        background: 'var(--paper)'
      } : {}),
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      background: hasNow ? 'var(--olive-100)' : 'var(--surface-sunken)',
      color: hasNow ? 'var(--olive-900)' : 'var(--ink-3)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-title)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, title), locations && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--ink-3)',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "map-pin",
    size: 13
  }), locations)), onClick && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 20,
    color: "var(--ink-3)",
    style: {
      flexShrink: 0
    }
  })), (overdue > 0 || due > 0) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, overdue > 0 && /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
    status: "overdue"
  }, overdue, " overdue"), due > 0 && /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
    status: "due"
  }, due, " due")), progress && progress.total > 0 && /*#__PURE__*/React.createElement(__ds_scope.ProgressBar, {
    done: progress.done,
    total: progress.total
  }), nextUp && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--text-caption)',
      color: 'var(--status-upcoming-text)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "calendar-clock",
    size: 14
  }), nextUp));
}
Object.assign(__ds_scope, { TaskCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/records/TaskCard.jsx", error: String((e && e.message) || e) }); }

// components/status/CountPill.jsx
try { (() => {
function CountPill({
  count,
  status = 'due',
  size = 'md',
  style
}) {
  const s = __ds_scope.statusStyles[status] || __ds_scope.statusStyles.due;
  const sm = size === 'sm';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: sm ? 22 : 28,
      height: sm ? 22 : 28,
      padding: '0 8px',
      boxSizing: 'border-box',
      borderRadius: 'var(--radius-full)',
      border: '1px ' + (s.dashed ? 'dashed' : 'solid') + ' ' + s.border,
      background: s.bg,
      color: s.ink,
      font: 'var(--fw-bold) ' + (sm ? '12px' : '14px') + '/1 var(--font-display)',
      ...style
    }
  }, count == null ? '—' : count);
}
Object.assign(__ds_scope, { CountPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/status/CountPill.jsx", error: String((e && e.message) || e) }); }

// components/records/LocationRow.jsx
try { (() => {
function LocationRow({
  name,
  sublabel,
  overdue,
  due,
  upcoming,
  done,
  onClick,
  style
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    role: onClick ? 'button' : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minHeight: 'var(--touch-min)',
      padding: '10px 16px',
      background: hover && onClick ? 'var(--paper)' : 'var(--surface-card)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-semibold) var(--fs-body)/1.3 var(--font-display)',
      color: 'var(--ink-1)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, name), sublabel && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--ink-3)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, sublabel)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      flexShrink: 0
    }
  }, overdue != null && overdue > 0 && /*#__PURE__*/React.createElement(__ds_scope.CountPill, {
    count: overdue,
    status: "overdue",
    size: "sm"
  }), due != null && due > 0 && /*#__PURE__*/React.createElement(__ds_scope.CountPill, {
    count: due,
    status: "due",
    size: "sm"
  }), upcoming != null && upcoming > 0 && /*#__PURE__*/React.createElement(__ds_scope.CountPill, {
    count: upcoming,
    status: "upcoming",
    size: "sm"
  }), done != null && done > 0 && /*#__PURE__*/React.createElement(__ds_scope.CountPill, {
    count: done,
    status: "done",
    size: "sm"
  }), onClick && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 20,
    color: "var(--ink-3)"
  })));
}
Object.assign(__ds_scope, { LocationRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/records/LocationRow.jsx", error: String((e && e.message) || e) }); }

// components/status/SyncPill.jsx
try { (() => {
function SyncPill({
  state = 'synced',
  count,
  style
}) {
  const states = {
    synced: {
      icon: 'check-check',
      label: 'Synced',
      ink: 'var(--ink-3)',
      bg: 'transparent',
      border: 'transparent'
    },
    pending: {
      icon: 'refresh-cw',
      label: (count || 0) + ' waiting to sync',
      ink: 'var(--amber-800)',
      bg: 'var(--amber-50)',
      border: 'var(--amber-100)'
    },
    offline: {
      icon: 'cloud-off',
      label: 'Offline — saving locally',
      ink: 'var(--ink-2)',
      bg: 'var(--surface-sunken)',
      border: 'transparent'
    }
  };
  const s = states[state] || states.synced;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 10px',
      borderRadius: 'var(--radius-full)',
      border: '1px solid ' + s.border,
      background: s.bg,
      color: s.ink,
      font: 'var(--fw-medium) var(--fs-caption)/1.2 var(--font-body)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: s.icon,
    size: 14
  }), s.label);
}
Object.assign(__ds_scope, { SyncPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/status/SyncPill.jsx", error: String((e && e.message) || e) }); }

// components/status/Tag.jsx
try { (() => {
function Tag({
  children,
  tone = 'neutral',
  mono = false,
  style
}) {
  const tones = {
    neutral: {
      bg: 'var(--surface-sunken)',
      ink: 'var(--ink-2)'
    },
    brand: {
      bg: 'var(--olive-100)',
      ink: 'var(--olive-900)'
    }
  };
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      background: t.bg,
      color: t.ink,
      font: mono ? 'var(--fw-medium) var(--fs-caption)/1.2 var(--font-mono)' : 'var(--fw-medium) var(--fs-caption)/1.2 var(--font-body)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/status/Tag.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sentri-mobile/doc-page.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <doc-page> — paged-document shell for printable HTML.
 *
 * FIRST, decide how the document paginates — up front, before building:
 *
 * - FLOWING document (the default): write the whole document as one
 *   normal HTML flow inside <doc-page>; the browser's print engine
 *   splits it onto pages at export. Use for long-form documents with a
 *   single text flow: reports, memos, letters, essays.
 * - EXPLICIT pagination: a fixed set of pre-paginated pages, one
 *   <section class="page"> child per page. Use when the user asks for a
 *   specific page count, or the design implies one: a one-page resume, a
 *   two-sided flier, a poster, a certificate, a brochure — any richly
 *   laid-out document without a single text flow.
 * - If in doubt, ask the user as part of the build.
 *
 * PAGE SIZING — paper differs by country (letter vs A4), so the printed
 * sheet is not one fixed truth:
 * - FLOWING documents pin NO paper size: the print engine paginates
 *   onto the user's real paper, and the content reflows to it.
 * - EXPLICITLY PAGINATED documents print each page at a FIXED page box
 *   with overflow hidden — letter by default, size="a4" for a clearly
 *   metric user, the user's chosen paper when they export. Design each
 *   page to FILL that box, fitting letter and A4 alike without overlap.
 * - width/height pin an explicit fixed size, ONLY when the user gives
 *   one.
 * Never write your own @page rule or hard-code paper dimensions in the
 * content.
 *
 * Sizing modes (attributes):
 *   (none)                      — portrait: flowing docs use the user's
 *           paper; explicitly paginated pages use the named size box
 *           (letter unless size="a4")
 *   orientation="landscape"     — the same, landscape
 *   width / height              — explicit fixed size, ONLY when the user
 *           gives one (e.g. width="22in" height="30in" for a 22×30
 *           poster): the page IS the design's size, printed at true
 *           dimensions (or scaled onto the user's paper at print time).
 *           Any absolute CSS length: px/in/mm/cm/pt/pc.
 * The component announces the chosen mode to the host app at runtime (a
 * meta tag it injects), so the print path can inject the user's true
 * paper size.
 *
 * On screen the document renders on a desk background: a flowing
 * document as one tall scrolling sheet (Google Docs' pageless view);
 * explicitly paginated documents as one card per page.
 *
 * EXPLICIT pagination usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page>
 *     <section class="page" id="p1">…one page's design…</section>
 *     <section class="page" id="p2">…</section>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 * How the page box works, concretely: each .page prints as ONE full-bleed
 * sheet at a FIXED physical size — letter by default (set size="a4" for
 * a clearly metric user), the user's chosen paper when they export —
 * with overflow hidden. Nothing scrolls and nothing reflows onto a next
 * sheet: content that misses the box is CLIPPED. Design each page to
 * FILL that page box, and to fit it — letter and A4 alike — without
 * overlap. Each page is a size container; don't size anything in
 * viewport units (they track the window, not the page), and never set
 * width or height on the .page section itself (the component sizes the
 * page box; an authored height like 100% is meaningless at print and is
 * overridden). The component owns the page box, the screen card chrome,
 * and the page breaks (never add your own break-before/after). Don't mix
 * .page sections with flowing content or header/footer slots in the same
 * document.
 *
 * FLOWING usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page margin="0.75in">
 *     <h1>Title</h1>
 *     <p>…body…</p>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 * There is no manual page-splitting — the browser's print engine
 * paginates at export. Standard break-hygiene rules (`break-inside:
 * avoid` on figures, code blocks, images and table rows; `orphans/
 * widows: 3`) are applied so paragraphs and groups split cleanly. On
 * screen and at print, headings default to `text-wrap: balance` and
 * body text to `text-wrap: pretty`; the defaults have zero specificity,
 * so any text-wrap you declare wins.
 *
 * Other attributes:
 *   size    — letter | a4 | legal (default letter). Flowing documents:
 *           preview proportion only — it does NOT pin their printed
 *           paper (the print dialog's paper governs); leave it alone
 *           there. Explicitly paginated documents: it sets the page box
 *           the cards and the pinned @page share (the export dialog's
 *           choice overrides both at print) — set size="a4" for a
 *           clearly metric user. Scaled-fit: names the sheet the fit is
 *           computed against, same a4-for-metric-users advice.
 *   content-width / content-height — the design's own fixed dimensions
 *           (CSS lengths), for scaling a fixed-size design ONTO the
 *           named sheet: content lays out at exactly this size, and the
 *           component scales it to fit that sheet's printable area
 *           (centered horizontally, top-aligned; the export dialog
 *           re-fits to the user's actual paper choice where available).
 *           Both must be set; they do not change the page box. For pages
 *           WITHOUT running header/footer slots.
 *   margin  — printable inset on every page of a FLOWING document
 *           (default 0.75in); margin="0" makes pages full-bleed.
 *           Explicitly paginated pages are always full-bleed.
 *
 * Running header/footer (flowing documents only): give an element
 * `slot="header"` or `slot="footer"` and it repeats on every printed
 * page via `position: fixed`. To keep body text from sliding under it,
 * the component prints inside a single-cell table whose <thead>/<tfoot>
 * are spacers sized to the header/footer height — browsers repeat
 * thead/tfoot on every page, so each sheet's content starts below the
 * header and ends above the footer. On screen the header/footer render
 * once at the top/bottom of the sheet.
 *
 * At print the component injects `@page { margin: 0 }` (which leaves
 * Chrome no margin box to draw its date/URL/page-count header in) and
 * moves the visual margin onto the sheet's own padding. It also marks
 * the document as owning its print CSS (a
 * `meta[name="omelette-owns-print"]` it injects at runtime), so the
 * PDF export never injects page-geometry CSS of its own on top.
 *
 * Print best practices for the content you author:
 * - Multi-column text: use CSS columns (`column-count` +
 *   `column-gap`), never side-by-side flex/grid columns — only real
 *   CSS columns flow and break across pages. `column-span: all` lets
 *   a heading span the columns; `hyphens: auto` (needs `lang` on
 *   the html element) keeps narrow columns readable.
 * - Page breaks in flowing documents: `break-before: page` on an
 *   element that must start a new page (a chapter, an appendix). Add
 *   your own kept-together blocks (callouts, stat tiles, cards) to a
 *   `break-inside: avoid` rule, and keep each one shorter than a page.
 * - Extend `orphans: 3; widows: 3` to any custom text blocks you add
 *   (p and li are covered by default).
 * - Give long tables a <thead> — browsers repeat it on every printed
 *   page.
 * - No `position: fixed`/`sticky` and no viewport units in content:
 *   fixed elements stamp every printed page (running headers/footers go
 *   in the component's slots) and `100vh` mis-sizes at print.
 *
 * Author content as static HTML so the user can click-to-edit any text
 * directly. Do not set width/padding/background on the document body —
 * the component owns the sheet box.
 */
/* END USAGE */

(() => {
  const PAPER = {
    letter: ['8.5in', '11in'],
    a4: ['210mm', '297mm'],
    legal: ['8.5in', '14in']
  };
  const CSS_LENGTH = /^\d+(\.\d+)?(px|in|mm|cm|pt|pc)$/;
  // Unitless "0" is a valid CSS length and the natural way to write
  // margin="0"; normalise it to 0px so max()/calc() (which reject a bare
  // number) keep working.
  const safeLen = (v, fb) => {
    v = (v || '').trim();
    return v === '0' ? '0px' : CSS_LENGTH.test(v) ? v : fb;
  };
  // WebKit (Safari and every iOS browser shell) never repeats a table's
  // thead/tfoot on printed pages (WebKit bug 17205), so the spacer-borne
  // vertical margins of a FLOWING document reach only the first page
  // there. Engine check, not browser check: vendor is 'Apple Computer,
  // Inc.' exactly for WebKit and 'Google Inc.' for Blink.
  const WK_PRINT = /apple/i.test(navigator.vendor || '');
  // CSS length → px number (CSS absolute units are exact: 1in = 96px).
  // Returns NaN for anything safeLen would reject — callers gate on it.
  const PX_PER = {
    px: 1,
    in: 96,
    mm: 96 / 25.4,
    cm: 96 / 2.54,
    pt: 96 / 72,
    pc: 16
  };
  const toPx = v => {
    const m = /^(\d+(?:\.\d+)?)(px|in|mm|cm|pt|pc)$/.exec((v || '').trim());
    return m ? parseFloat(m[1]) * PX_PER[m[2]] : NaN;
  };
  const stylesheet = `
    :host {
      position: relative;
      display: block;
      /* When the viewport is narrower than the page, grow to wrap the
       * sheet (plus this padding) instead of staying viewport-width, so
       * the desk background and right margin reach the sheet's far edge
       * in the horizontal scroll. */
      min-width: max-content;
      min-height: 100vh;
      background: #f5f5f4;
      padding: 48px 24px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      --doc-page-w: 8.5in;
      --doc-page-h: 11in;
      --doc-page-margin: 0.75in;
      --doc-hdr-h: 0px;
      --doc-ftr-h: 0px;
      --doc-hdr-pad: 0px;
      --doc-ftr-pad: 0px;
    }
    .sheet {
      width: var(--doc-page-w);
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 2px 10px rgba(20, 20, 19, 0.12);
      border-radius: 7px;
      box-sizing: border-box;
      padding: var(--doc-page-margin);
    }
    .frame { width: 100%; border-collapse: collapse; }
    /* Scaled-fit mode (content-width/content-height): the inner .fit box
     * lays the content out at its authored fixed size and scales it onto
     * the printable area; .fit-box reserves the scaled footprint in flow
     * (transforms don't affect layout) and centers it. Without the mode,
     * both divs are unstyled block pass-throughs. */
    /* Explicit pagination: direct .page children are the pages. The sheet
     * becomes a transparent stack and each page carries the card look on
     * screen; at print each page is exactly one full-bleed sheet. The
     * ::slotted defaults are deliberately weak (document CSS wins), so
     * authored page styling can override any of this. */
    .sheet.paginated {
      background: transparent;
      box-shadow: none;
      border-radius: 0;
      padding: 0;
    }
    .paginated ::slotted(.page) {
      position: relative;
      display: block;
      width: 100%;
      aspect-ratio: var(--doc-page-ar);
      container-type: size;
      overflow: hidden;
      box-sizing: border-box;
      background: #fff;
      border-radius: 7px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      break-inside: avoid;
    }
    .paginated ::slotted(.page:not(:first-child)) { margin-top: 1rem; }
    @media print {
      .sheet.paginated { padding: 0; }
      /* The flowing-document vertical inset lives on the repeating
       * thead/tfoot spacers, not the sheet padding — they must go too,
       * or each full-sheet .page is pushed ~margin down and spills onto
       * a second sheet. Paginated pages are full-bleed by definition
       * (content owns its insets). */
      .sheet.paginated .hdr-space,
      .sheet.paginated .ftr-space { height: 0; }
      .paginated ::slotted(.page) {
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
        /* Physical page-box sizing, no viewport units: Safari resolves
         * 100vh against the window, not the page box, so a vh-sized card
         * paginates wrong there. --doc-page-w/h are the named size by
         * default and are overridden to the user's chosen paper by the
         * export path, so every card is exactly one sheet either way.
         * Width + height (same source values as @page size) rather than
         * width + aspect-ratio: the ratio is a 6-decimal rounding of the
         * same division, and a few millionths of overflow would spill a
         * blank sheet after every page. The screen-only aspect-ratio
         * (preview proportions) must not leak into print. cqh typography
         * tracks the same box.
         *
         * Every declaration is !important: per CSS Scoping, unimportant
         * shadow ::slotted rules LOSE to the document context, so a page
         * section's authored inline style would silently beat this print
         * geometry. A model-authored height:100% did exactly that — the
         * percentage resolves as auto in the all-auto print ancestry, the
         * base rule's size containment turns auto into ZERO, and
         * overflow:hidden then paints nothing: a blank PDF with perfect
         * page boxes. At print the component's geometry is the design's
         * whole contract, so it must win over any authored sizing. */
        aspect-ratio: auto !important;
        width: var(--doc-page-w) !important;
        height: var(--doc-page-h) !important;
        overflow: hidden !important;
      }
      .paginated ::slotted(.page:not(:first-child)) {
        break-before: page !important;
        margin-top: 0 !important;
      }
    }
    .fit-mode .fit-box {
      width: calc(var(--doc-fit-w) * var(--doc-fit-scale));
      height: calc(var(--doc-fit-h) * var(--doc-fit-scale));
      margin: 0 auto;
      break-inside: avoid;
    }
    .fit-mode .fit {
      width: var(--doc-fit-w);
      height: var(--doc-fit-h);
      transform: scale(var(--doc-fit-scale));
      transform-origin: top left;
    }
    .frame td, .frame th { padding: 0; text-align: left; font-weight: inherit; }
    .hdr-space { height: var(--doc-hdr-h); }
    .ftr-space { height: var(--doc-ftr-h); }
    ::slotted([slot="header"]),
    ::slotted([slot="footer"]) { display: block; box-sizing: border-box; }
    @media print {
      :host { background: none; padding: 0; min-width: 0; min-height: 0; }
      .sheet {
        width: auto; margin: 0; box-shadow: none; border-radius: 0;
        padding: 0 var(--doc-page-margin);
      }
      /* The thead/tfoot spacers repeat on every page, so they carry the
       * vertical page margin (which the sheet's own padding cannot, since
       * that padding is consumed once on the first/last page). The running
       * header/footer are fixed inside that band. */
      /* The 0.35in is breathing room between a running header/footer and
       * the body; without one the spacer is exactly the page margin, so a
       * margin="0" full-bleed document gets truly full-bleed pages. */
      .hdr-space { height: max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))); }
      .ftr-space { height: max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))); }
      /* WebKit flowing documents: @page carries the vertical margin (see
       * _syncPrintPageRule), so the spacers keep only whatever a running
       * header/footer needs BEYOND it — page 1 would otherwise double its
       * top inset. Paginated sheets already zero their spacers above. */
      .sheet.wk-print:not(.paginated) .hdr-space { height: max(0px, calc(max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))) - var(--doc-page-margin))); }
      .sheet.wk-print:not(.paginated) .ftr-space { height: max(0px, calc(max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))) - var(--doc-page-margin))); }
      ::slotted([slot="header"]) {
        position: fixed; top: 0; left: 0; right: 0; margin: 0;
        padding: calc(var(--doc-page-margin) * 0.45) var(--doc-page-margin) 0;
      }
      ::slotted([slot="footer"]) {
        position: fixed; bottom: 0; left: 0; right: 0; margin: 0;
        padding: 0 var(--doc-page-margin) calc(var(--doc-page-margin) * 0.45);
      }
    }
  `;
  class DocPage extends HTMLElement {
    static get observedAttributes() {
      return ['size', 'width', 'height', 'margin', 'orientation', 'content-width', 'content-height'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._mo = typeof MutationObserver === 'function' ? new MutationObserver(() => this._scheduleMeasure()) : null;
    }

    /** The named paper's [w, h], swapped when orientation="landscape".
     *  Only the named size swaps — explicit width/height are exact values
     *  the author already oriented. */
    _paperSize() {
      const named = PAPER[(this.getAttribute('size') || '').toLowerCase()] || PAPER.letter;
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? [named[1], named[0]] : named;
    }
    get pageWidth() {
      return safeLen(this.getAttribute('width'), this._paperSize()[0]);
    }
    get pageHeight() {
      return safeLen(this.getAttribute('height'), this._paperSize()[1]);
    }
    get pageMargin() {
      return safeLen(this.getAttribute('margin'), '0.75in');
    }

    /** Scaled-fit mode's content box [w, h] as CSS lengths, or null when
     *  the mode is off (either attribute missing/invalid/zero — a partial
     *  declaration falls back to normal flow rather than guessing). */
    _contentFit() {
      const w = safeLen(this.getAttribute('content-width'), null);
      const h = safeLen(this.getAttribute('content-height'), null);
      if (!w || !h) return null;
      const wPx = toPx(w),
        hPx = toPx(h);
      return wPx > 0 && hPx > 0 ? [w, h, wPx, hPx] : null;
    }
    connectedCallback() {
      if (!this._sheet) this._render();
      this._syncSize();
      this._syncPrintPageRule();
      this._ensureTextWrapDefaults();
      this._ensureOwnsPrintMeta();
      this._syncFixedSizeMeta();
      this._syncPrintSizingMeta();
      if (this._mo) this._mo.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      this._onResize = () => this._scheduleMeasure();
      window.addEventListener('resize', this._onResize);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this._scheduleMeasure());
      }
      this._scheduleMeasure();
    }
    disconnectedCallback() {
      window.removeEventListener('resize', this._onResize);
      if (this._mo) this._mo.disconnect();
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
      // Drop the head rules when the last doc-page leaves, so a deleted
      // document's @page geometry and text-wrap defaults can't apply to
      // whatever replaces it.
      const survivor = document.querySelector('doc-page');
      if (!survivor) {
        ['doc-page-print', 'doc-page-text-wrap', 'doc-page-owns-print', 'doc-page-fixed-size', 'doc-page-print-sizing'].forEach(id => {
          const tag = document.getElementById(id);
          if (tag) tag.remove();
        });
        // A live deck-stage deferred its own print-sizing meta to ours —
        // hand the page-global meta over so the deck isn't left unmarked.
        const deck = document.querySelector('deck-stage');
        if (deck && typeof deck._ensurePrintSizingMeta === 'function') {
          deck._ensurePrintSizingMeta();
        }
      } else {
        // A departed owner hands each page-global meta to whatever
        // doc-page remains (or it's removed).
        if (typeof survivor._syncFixedSizeMeta === 'function') {
          survivor._syncFixedSizeMeta();
        }
        if (typeof survivor._syncPrintSizingMeta === 'function') {
          survivor._syncPrintSizingMeta();
        }
      }
    }
    attributeChangedCallback() {
      if (!this._sheet) return;
      this._syncSize();
      this._syncPrintPageRule();
      this._syncFixedSizeMeta();
      this._syncPrintSizingMeta();
      this._scheduleMeasure();
    }
    _render() {
      this._root.innerHTML = `
        <style>${stylesheet}</style>
        <style id="vars"></style>
        <div class="sheet" data-screen-label="Document">
          <table class="frame" role="presentation">
            <thead><tr><th><div class="hdr-space"><slot name="header"></slot></div></th></tr></thead>
            <tbody><tr><td class="body"><div class="fit-box"><div class="fit"><slot></slot></div></div></td></tr></tbody>
            <tfoot><tr><td><div class="ftr-space"><slot name="footer"></slot></div></td></tr></tfoot>
          </table>
        </div>`;
      this._sheet = this._root.querySelector('.sheet');
      this._vars = this._root.getElementById('vars');
    }

    /** Runtime sizing lives in a shadow <style> :host rule, never on the
     *  light-DOM host element, so serialize-persist can't write it back. */
    _syncSize(hdrH, ftrH) {
      // Scaled-fit mode: content at its authored size, scaled onto the
      // printable area (page minus margins on both axes). The factor is a
      // plain number var so calc(length * number) stays valid; 4 decimals
      // keeps the shadow style stable across re-measures. Upscaling is
      // allowed — print transforms are vector, so text and CSS stay crisp
      // (raster images soften, which the catalog bullet warns about).
      const fit = this._contentFit();
      let fitVars = '';
      if (fit) {
        const marginPx = toPx(this.pageMargin) || 0;
        const availW = toPx(this.pageWidth) - 2 * marginPx;
        const availH = toPx(this.pageHeight) - 2 * marginPx;
        const scale = Math.min(availW / fit[2], availH / fit[3]);
        if (scale > 0 && Number.isFinite(scale)) {
          fitVars = '--doc-fit-w:' + fit[0] + ';' + '--doc-fit-h:' + fit[1] + ';' + '--doc-fit-scale:' + scale.toFixed(4) + ';';
        }
      }
      this._sheet.classList.toggle('fit-mode', !!fitVars);
      // Numeric w/h ratio for the paginated page cards' aspect-ratio —
      // aspect-ratio takes a number, not a length ratio, so compute it
      // here (CSS length division isn't portable). 6 decimals keeps the
      // shadow style stable across re-syncs.
      const arW = toPx(this.pageWidth);
      const arH = toPx(this.pageHeight);
      const ar = arW > 0 && arH > 0 ? (arW / arH).toFixed(6) : '0.772727';
      this._vars.textContent = ':host{' + fitVars + '--doc-page-ar:' + ar + ';' + '--doc-page-w:' + this.pageWidth + ';' + '--doc-page-h:' + this.pageHeight + ';' + '--doc-page-margin:' + this.pageMargin + ';' + '--doc-hdr-h:' + (hdrH || 0) + 'px;' + '--doc-ftr-h:' + (ftrH || 0) + 'px;' + '--doc-hdr-pad:' + (hdrH ? '0.35in' : '0px') + ';' + '--doc-ftr-pad:' + (ftrH ? '0.35in' : '0px') + '}';
    }

    /** @page is a no-op inside shadow DOM, so the rule lives in <head>.
     *  Re-appended on every sync so it stays last in source order — the
     *  @page cascade is source-order per descriptor, so this rule wins
     *  over any other @page rule in the document.
     *
     *  The @page SIZE is pinned where the page box IS part of the design:
     *  explicit-fixed-size mode (width + height authored), scaled-fit
     *  mode (the named sheet the fit targets), and explicit pagination
     *  (the named size the cards share — so card and sheet agree on
     *  every print path, and the export path's chosen paper overrides
     *  BOTH with one later rule). For FLOWING documents no paper size is
     *  emitted at all — the true size comes from the user's preference,
     *  injected by the export path or chosen in the print dialog — so a
     *  flowing document never fights the paper it lands on.
     *  margin: 0 is emitted in every mode: it leaves Chrome no margin box
     *  to draw its date/URL/page-count header in, and the visual margin
     *  lives on the sheet's own padding. */
    _syncPrintPageRule() {
      const id = 'doc-page-print';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
      }
      document.head.appendChild(tag);
      // Three print-geometry regimes:
      // - true-size: the page IS the design — pin its exact size.
      // - scaled-fit (content-width/height): the fit factor is computed
      //   against the NAMED paper's printable area, so that paper must
      //   stay pinned or the scaled content overflows a smaller sheet
      //   (the export path re-fits and re-pins at print time on top).
      // - default modes: no paper size — but landscape still needs the
      //   paper-agnostic 'size: landscape' keyword, because the size
      //   descriptor is what carries orientation; without it a landscape
      //   document prints portrait whenever nothing injects a size.
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      // Explicit pagination pins the page box to the SAME values that
      // size the cards (the named size by default, the export path's
      // chosen paper when its later rule overrides both) — card and
      // sheet agree on every print path, and a mismatched real paper
      // shrinks-to-fit in the dialog instead of clipping a Letter card
      // on A4. Declared before the paginated read below so both derive
      // from one check.
      const paginatedNow = this.querySelector(':scope > .page') !== null;
      const sizeDescriptor = this._trueSizePx() ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : this._contentFit() ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : paginatedNow ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : landscape ? 'size: landscape; ' : '';
      // WebKit never repeats the thead/tfoot spacers that carry a flowing
      // document's vertical page margins (see WK_PRINT above), so pages
      // after the first print edge-to-edge there. Carry the VERTICAL
      // margins on @page for WebKit instead, and the shadow print CSS
      // trims the first-page spacers by the same amount (.sheet.wk-print
      // rules). Horizontal inset stays on the sheet's own padding in
      // every engine. Blink keeps margin: 0 (a nonzero margin there
      // re-opens the box Chrome draws its header furniture in). One cost,
      // learned in testing: Safari's own date/URL headers are a USER
      // dialog setting ("Print headers and footers") that renders in the
      // margin area when room exists — margin: 0 only suppressed it by
      // leaving no room, and no CSS controls it. The export dialog's
      // Safari guide teaches turning the setting off for flowing
      // documents. Explicitly paginated and fixed-size documents keep
      // margin: 0 everywhere: their pages ARE the sheet.
      const wkFlowing = WK_PRINT && !paginatedNow && !this._trueSizePx() && !this._contentFit();
      const marginDescriptor = wkFlowing ? 'margin: ' + this.pageMargin + ' 0; ' : 'margin: 0; ';
      // Shadow-internal marker (never serialized), kept in lockstep with
      // the @page decision above: the print CSS trims the first-page
      // spacers ONLY while @page actually carries the margins — a
      // true-size or scaled-fit sheet keeps margin: 0 and must keep its
      // spacers too. Re-synced here so attribute changes and pagination
      // flips move both together.
      if (this._sheet) this._sheet.classList.toggle('wk-print', wkFlowing);
      tag.textContent = '@page { ' + sizeDescriptor + marginDescriptor + '} ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; height: auto !important; overflow: visible !important; } ' + 'h1,h2,h3,h4,h5,h6 { break-after: avoid; } ' + 'figure,pre,blockquote,img,svg,tr { break-inside: avoid; } ' + 'p,li { orphans: 3; widows: 3; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; ' + 'backdrop-filter: none !important; -webkit-backdrop-filter: none !important; } ' + '*, *::before, *::after { animation-delay: -99s !important; animation-duration: .001s !important; ' + 'animation-iteration-count: 1 !important; animation-fill-mode: both !important; ' + 'animation-play-state: running !important; transition-duration: 0s !important; } }';
    }

    /** Typographic defaults for document text: balance headings, avoid
     *  widowed/orphaned words in body copy (browsers without text-wrap
     *  support drop the declarations). Zero-specificity via :where() so
     *  any text-wrap authored on those elements wins; document-level so the
     *  rules reach the slotted (light DOM) content — shadow styles can't.
     *  data-omelette-injected marks the tag for the host editor to strip
     *  at serialize, so it is never written back as authored source. */
    _ensureTextWrapDefaults() {
      if (document.getElementById('doc-page-text-wrap')) return;
      const tag = document.createElement('style');
      tag.id = 'doc-page-text-wrap';
      tag.setAttribute('data-omelette-injected', '');
      tag.textContent = ':where(h1,h2,h3,h4,h5,h6){text-wrap:balance}' + ':where(p,li,blockquote,figcaption){text-wrap:pretty}';
      document.head.appendChild(tag);
    }

    /** Declares that this document owns its print CSS. The instant-PDF
     *  export checks for the meta by NAME PRESENCE alone (content is
     *  ignored) and skips its automatic print-CSS injections, so the
     *  component's @page geometry is never overridden by a heuristic.
     *  data-omelette-injected keeps it out of serialized source. */
    _ensureOwnsPrintMeta() {
      if (document.getElementById('doc-page-owns-print')) return;
      const tag = document.createElement('meta');
      tag.id = 'doc-page-owns-print';
      tag.name = 'omelette-owns-print';
      tag.content = 'true';
      tag.setAttribute('data-omelette-injected', '');
      document.head.appendChild(tag);
    }

    /** This page's valid true-size page box (explicit width AND height)
     *  as [w, h] px ints, or null when the mode is off. */
    _trueSizePx() {
      if (!safeLen(this.getAttribute('width'), null) || !safeLen(this.getAttribute('height'), null)) return null;
      const w = Math.round(toPx(this.pageWidth));
      const h = Math.round(toPx(this.pageHeight));
      return w > 0 && h > 0 ? [w, h] : null;
    }

    /** True-size pages (explicit width AND height) also declare the page
     *  box as the preview size: the in-app preview reads
     *  meta[name="omelette-fixed-size"] (content "W,H" in px ints) and
     *  scales the sheet into view — without it an 18in poster previews at
     *  true size with scrollbars. Never overrides an author-set meta
     *  (only the component's own id is managed). The meta is page-global
     *  while doc-page instances are not, so every sync recomputes the
     *  page-wide owner — the first connected true-size doc-page — and a
     *  non-true-size sibling's sync can never delete the owner's meta.
     *  Removed when no true-size page remains (the owner's disconnect
     *  re-syncs via any survivor) or when an author-set meta exists. */
    _syncFixedSizeMeta() {
      const id = 'doc-page-fixed-size';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-fixed-size"]:not([data-omelette-injected])');
      // The page-wide owner, not this instance: an upgraded true-size page
      // anywhere in the document keeps the meta alive and sized.
      let box = null;
      for (const el of document.querySelectorAll('doc-page')) {
        box = typeof el._trueSizePx === 'function' ? el._trueSizePx() : null;
        if (box) break;
      }
      if (!box || authored) {
        if (own) own.remove();
        return;
      }
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-fixed-size';
      tag.content = box[0] + ',' + box[1];
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }

    /** This page's print-sizing mode: 'fixed' when an explicit width AND
     *  height are authored (the page is the design's own size), else the
     *  default paper in the authored orientation. */
    _printSizingMode() {
      if (this._trueSizePx()) return 'fixed';
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? 'default-landscape' : 'default-portrait';
    }

    /** Announces the print-sizing mode to the host app:
     *  meta[name="omelette-print-sizing"] with content 'default-portrait',
     *  'default-landscape', or 'fixed' (fixed pages also carry the
     *  omelette-fixed-size meta with the page box in px). The export path
     *  probes it to decide what true paper size to inject at print time —
     *  in the default modes the component emits no paper size of its own.
     *  Same page-global ownership rules as the fixed-size meta above:
     *  first connected doc-page owns it, an authored meta is never
     *  overridden, removed when no doc-page remains. */
    _syncPrintSizingMeta() {
      const id = 'doc-page-print-sizing';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-print-sizing"]:not([data-omelette-injected])');
      // A fixed page wins outright (mirroring the fixed-size loop above,
      // so the two metas can never contradict each other in a mixed
      // multi-page document); otherwise the first page's mode holds.
      let mode = null;
      for (const el of document.querySelectorAll('doc-page')) {
        if (typeof el._printSizingMode !== 'function') continue;
        const m = el._printSizingMode();
        if (m === 'fixed') {
          mode = m;
          break;
        }
        if (mode === null) mode = m;
      }
      if (!mode || authored) {
        if (own) own.remove();
        return;
      }
      // A deck-stage that connected first injected its own meta and
      // defers to any existing one — take it over, or the document ends
      // up with two conflicting injected metas (a doc-page page is the
      // document; the deck re-ensures its meta if every doc-page leaves).
      const deckMeta = document.getElementById('deck-stage-print-sizing');
      if (deckMeta) deckMeta.remove();
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-print-sizing';
      tag.content = mode;
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }
    _scheduleMeasure() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this._raf = null;
        this._measure();
      });
    }

    /** Slot heights feed the print spacers (--doc-hdr-h / --doc-ftr-h), so
     *  they re-measure on content mutation, resize, and font load. The
     *  same pass detects explicit pagination (direct .page children) and
     *  toggles the sheet between the flowing-document card and the
     *  page-per-card stack — content edits can add or remove pages at any
     *  time, so this tracks the same mutations the measurement does. */
    _measure() {
      const hdr = this.querySelector(':scope > [slot="header"]');
      const ftr = this.querySelector(':scope > [slot="footer"]');
      const wasPaginated = this._sheet.classList.contains('paginated');
      this._sheet.classList.toggle('paginated', this.querySelector(':scope > .page') !== null);
      // The WebKit @page margin is flowing-only, so a pagination flip
      // must re-emit the rule (content edits can add or remove .page
      // sections at any time).
      if (this._sheet.classList.contains('paginated') !== wasPaginated) {
        this._syncPrintPageRule();
      }
      this._syncSize(hdr ? hdr.offsetHeight : 0, ftr ? ftr.offsetHeight : 0);
    }
  }
  if (!customElements.get('doc-page')) {
    customElements.define('doc-page', DocPage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sentri-mobile/doc-page.js", error: String((e && e.message) || e) }); }

// ui_kits/sentri-mobile/screens/AnimalsScreen.jsx
try { (() => {
function AnimalsScreen() {
  const {
    TopBar,
    TopBarAction,
    Input,
    AnimalRow
  } = window.SentriDesignSystem_44ba05;
  const all = [{
    id: 'SOW-04182',
    pen: 'GESTATION 1 · PEN 14',
    meta: 'Parity 3 · Batch 24-31 · Day 28 pregnant'
  }, {
    id: 'SOW-04190',
    pen: 'GESTATION 1 · PEN 15',
    note: 'On health watch',
    st: 'blocked',
    lbl: 'Health watch'
  }, {
    id: 'SOW-04220',
    pen: 'GESTATION 1 · PEN 19',
    meta: 'Parity 1 · Batch 24-31'
  }, {
    id: 'SOW-03911',
    pen: 'FARROWING 1 · PEN 03',
    meta: 'Parity 4 · Farrowed 4 Aug · 13 piglets'
  }, {
    id: 'SOW-03924',
    pen: 'FARROWING 1 · PEN 05',
    meta: 'Parity 2 · Farrowed 6 Aug · 12 piglets'
  }, {
    id: 'GILT-00412',
    pen: 'GESTATION 3 · PEN 02',
    meta: 'No batch assigned',
    st: 'none',
    lbl: 'No status'
  }];
  const [q, setQ] = React.useState('');
  const list = all.filter(a => a.id.toLowerCase().includes(q.toLowerCase()));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: "Animals",
    subtitle: "1,846 on site",
    actions: /*#__PURE__*/React.createElement(TopBarAction, {
      icon: "scan-line",
      label: "Scan ear tag"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px',
      background: 'var(--surface-card)',
      borderBottom: '1px solid var(--line-2)'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    icon: "search",
    placeholder: "Search ear tag or ID",
    value: q,
    onChange: setQ
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      minHeight: 0,
      background: 'var(--surface-card)'
    }
  }, list.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      font: 'var(--text-body)',
      color: 'var(--ink-3)'
    }
  }, "No animals match \u201C", q, "\u201D."), list.map((a, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: a.id
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--line-2)'
    }
  }), /*#__PURE__*/React.createElement(AnimalRow, {
    id: a.id,
    pen: a.pen,
    meta: a.meta,
    note: a.note,
    status: a.st,
    statusLabel: a.lbl,
    onClick: () => {}
  })))));
}
Object.assign(window, {
  AnimalsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sentri-mobile/screens/AnimalsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sentri-mobile/screens/TodayScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TodayScreen({
  mode,
  setMode,
  onOpenUnit
}) {
  const {
    TopBar,
    TopBarAction,
    Stat,
    SegmentedControl,
    TaskCard,
    LocationRow,
    SyncPill
  } = window.SentriDesignSystem_44ba05;
  const units = [{
    name: 'Gestation 1',
    sub: '24 pens · Batch 24-31',
    overdue: 2,
    due: 14
  }, {
    name: 'Gestation 2',
    sub: '24 pens · Batch 24-32',
    due: 9
  }, {
    name: 'Gestation 3',
    sub: '20 pens · Batch 24-33',
    due: 8,
    upcoming: 6
  }, {
    name: 'Farrowing 1',
    sub: '12 pens · Batch 24-28',
    due: 5,
    done: 7
  }, {
    name: 'Nursery A',
    sub: '8 pens · Batch 24-25',
    upcoming: 12
  }];
  const tasks = [{
    title: 'Pregnancy check',
    icon: 'search-check',
    overdue: 2,
    due: 31,
    locations: 'Gestation 1–3',
    progress: {
      done: 18,
      total: 31
    },
    nextUp: '18 eligible in 4 days'
  }, {
    title: 'Heat detection',
    icon: 'flame',
    due: 6,
    locations: 'Gestation 2',
    progress: {
      done: 2,
      total: 6
    }
  }, {
    title: 'Vaccination',
    icon: 'syringe',
    due: 5,
    locations: 'Farrowing 1',
    progress: {
      done: 0,
      total: 5
    }
  }, {
    title: 'Weaning',
    icon: 'arrow-right-left',
    locations: 'Farrowing 1',
    nextUp: '42 piglets due Thursday'
  }, {
    title: 'Feed adjustment',
    icon: 'wheat',
    due: 3,
    locations: 'Gestation 3',
    progress: {
      done: 0,
      total: 3
    }
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: "H\xF8jgaard Farm",
    subtitle: "Wednesday 13 August",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TopBarAction, {
      icon: "scan-line",
      label: "Scan ear tag"
    }), /*#__PURE__*/React.createElement(TopBarAction, {
      icon: "bell",
      label: "Alerts",
      badge: 3
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '8px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: 45,
    label: "Due now"
  }), /*#__PURE__*/React.createElement(Stat, {
    value: 2,
    label: "Overdue",
    tone: "overdue"
  }), /*#__PURE__*/React.createElement(Stat, {
    value: 20,
    suffix: "of 45",
    label: "Recorded"
  })), /*#__PURE__*/React.createElement(SyncPill, {
    state: "pending",
    count: 2
  })), /*#__PURE__*/React.createElement(SegmentedControl, {
    value: mode,
    onChange: setMode,
    options: [{
      value: 'task',
      label: 'By task',
      icon: 'clipboard-list'
    }, {
      value: 'location',
      label: 'By location',
      icon: 'map-pin'
    }]
  }), mode === 'task' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, tasks.map(t => /*#__PURE__*/React.createElement(TaskCard, _extends({
    key: t.title
  }, t, {
    onClick: () => onOpenUnit(t.title)
  })))) : /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px 6px',
      font: 'var(--fw-semibold) var(--fs-caption)/1.2 var(--font-body)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--ink-3)'
    }
  }, "Section B"), units.map((u, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: u.name
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--line-2)'
    }
  }), /*#__PURE__*/React.createElement(LocationRow, {
    name: u.name,
    sublabel: u.sub,
    overdue: u.overdue,
    due: u.due,
    upcoming: u.upcoming,
    done: u.done,
    onClick: () => onOpenUnit('Pregnancy check')
  })))))));
}
Object.assign(window, {
  TodayScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sentri-mobile/screens/TodayScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sentri-mobile/screens/UnitScreen.jsx
try { (() => {
function UnitScreen({
  onBack,
  showToast,
  task
}) {
  const {
    TopBar,
    TopBarAction,
    Tabs,
    AnimalRow,
    ActionBar,
    Sheet,
    Button,
    Select,
    ProgressBar,
    StatusBadge
  } = window.SentriDesignSystem_44ba05;
  const [tab, setTab] = React.useState('due');
  const [animals, setAnimals] = React.useState([{
    id: 'SOW-04182',
    pen: 'PEN 14',
    meta: 'Parity 3 · Day 28',
    st: 'due'
  }, {
    id: 'SOW-04186',
    pen: 'PEN 14',
    meta: 'Parity 1 · Day 28',
    st: 'due'
  }, {
    id: 'SOW-04190',
    pen: 'PEN 15',
    note: 'On health watch',
    st: 'due'
  }, {
    id: 'SOW-04193',
    pen: 'PEN 15',
    meta: 'Parity 4 · Day 29',
    st: 'due'
  }, {
    id: 'SOW-04201',
    pen: 'PEN 16',
    meta: 'Parity 2 · Day 30',
    st: 'due',
    overdue: true
  }, {
    id: 'SOW-04205',
    pen: 'PEN 16',
    meta: 'Parity 2 · Day 31',
    st: 'due',
    overdue: true
  }, {
    id: 'SOW-04212',
    pen: 'PEN 17',
    meta: 'Parity 5 · Day 28',
    st: 'due'
  }, {
    id: 'SOW-04218',
    pen: 'PEN 18',
    meta: 'No status recorded',
    st: 'due',
    none: true
  }, {
    id: 'SOW-04220',
    pen: 'PEN 19',
    meta: 'Eligible in 4 days',
    st: 'upcoming'
  }, {
    id: 'SOW-04223',
    pen: 'PEN 19',
    meta: 'Eligible in 4 days',
    st: 'upcoming'
  }, {
    id: 'SOW-04174',
    pen: 'PEN 12',
    meta: 'Pregnant · M. Larsen · 09:42',
    st: 'done'
  }, {
    id: 'SOW-04178',
    pen: 'PEN 13',
    meta: 'Pregnant · M. Larsen · 09:38',
    st: 'done'
  }]);
  const [sel, setSel] = React.useState({});
  const [sheet, setSheet] = React.useState(false);
  const [result, setResult] = React.useState('Pregnant');
  const groups = {
    due: animals.filter(a => a.st === 'due'),
    upcoming: animals.filter(a => a.st === 'upcoming'),
    done: animals.filter(a => a.st === 'done')
  };
  const selIds = Object.keys(sel).filter(k => sel[k]);
  const record = () => {
    setAnimals(animals.map(a => selIds.includes(a.id) ? {
      ...a,
      st: 'done',
      none: false,
      overdue: false,
      meta: result + ' · You · just now'
    } : a));
    setSel({});
    setSheet(false);
    showToast(selIds.length + (selIds.length === 1 ? ' result' : ' results') + ' recorded');
  };
  const list = groups[tab];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: "Gestation 1",
    subtitle: 'Section B · ' + (task || 'Pregnancy check'),
    onBack: onBack,
    actions: /*#__PURE__*/React.createElement(TopBarAction, {
      icon: "scan-line",
      label: "Scan ear tag"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px',
      background: 'var(--surface-card)',
      borderBottom: '1px solid var(--line-2)'
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    label: task || 'Pregnancy check',
    done: groups.done.length,
    total: groups.done.length + groups.due.length
  })), /*#__PURE__*/React.createElement(Tabs, {
    style: {
      padding: '12px 16px',
      background: 'var(--surface-card)'
    },
    value: tab,
    onChange: t => {
      setTab(t);
      setSel({});
    },
    tabs: [{
      value: 'due',
      label: 'Due',
      count: groups.due.length
    }, {
      value: 'upcoming',
      label: 'Upcoming',
      count: groups.upcoming.length
    }, {
      value: 'done',
      label: 'Done',
      count: groups.done.length
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      minHeight: 0,
      background: 'var(--surface-card)'
    }
  }, list.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      font: 'var(--text-body)',
      color: 'var(--ink-3)'
    }
  }, "Nothing ", tab === 'due' ? 'due now' : tab, " in this unit."), list.map((a, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: a.id
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--line-2)'
    }
  }), /*#__PURE__*/React.createElement(AnimalRow, {
    id: a.id,
    pen: a.pen,
    meta: a.meta,
    note: a.note,
    status: a.none ? 'none' : a.overdue ? 'overdue' : a.st,
    statusLabel: a.none ? 'Not checked' : a.overdue ? 'Overdue' : a.st === 'due' ? 'Day 28+' : a.st === 'upcoming' ? 'In 4 days' : 'Done',
    selected: !!sel[a.id],
    onSelect: tab === 'due' ? v => setSel({
      ...sel,
      [a.id]: v
    }) : undefined
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8
    }
  })), selIds.length > 0 && /*#__PURE__*/React.createElement(ActionBar, {
    message: selIds.length + ' selected'
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setSel({})
  }, "Clear"), /*#__PURE__*/React.createElement(Button, {
    icon: "check",
    onClick: () => setSheet(true)
  }, "Record")), /*#__PURE__*/React.createElement(Sheet, {
    open: sheet,
    onClose: () => setSheet(false),
    title: 'Record result — ' + selIds.length + ' selected',
    footer: /*#__PURE__*/React.createElement(Button, {
      size: "lg",
      full: true,
      icon: "check-check",
      onClick: record
    }, 'Record ' + selIds.length + (selIds.length === 1 ? ' result' : ' results'))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Result",
    options: ['Pregnant', 'Not pregnant', 'Recheck needed'],
    value: result,
    onChange: setResult
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--ink-3)'
    }
  }, "Same result is applied to all selected animals. Records save locally when offline."))));
}
Object.assign(window, {
  UnitScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sentri-mobile/screens/UnitScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.TopBar = __ds_scope.TopBar;

__ds_ns.TopBarAction = __ds_scope.TopBarAction;

__ds_ns.ActionBar = __ds_scope.ActionBar;

__ds_ns.Sheet = __ds_scope.Sheet;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.AnimalRow = __ds_scope.AnimalRow;

__ds_ns.LocationRow = __ds_scope.LocationRow;

__ds_ns.TaskCard = __ds_scope.TaskCard;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.CountPill = __ds_scope.CountPill;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.SyncPill = __ds_scope.SyncPill;

__ds_ns.Tag = __ds_scope.Tag;

})();
