import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Animated, Easing } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import Avatar from "../components/Avatar";
import { CHARACTERS } from "../lib/avatars";
import { colors, spacing, type } from "../lib/theme";

const EXPERIENCES = ["DECO3500 - Project Experience"];
const YEAR_OPTIONS = [24];
const DEFAULT_YEARS = 24;

/** Slides/fades its children in from `from` (px offset on Y) when mounted. */
function SlideIn({ from, children, style }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[style, { opacity: t, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

function Dropdown({ label, value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ zIndex: open ? 10 : 1 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={[styles.input, styles.dropBtn, !!label && { marginTop: 8 }]} onPress={() => setOpen((o) => !o)}>
        <Text numberOfLines={1} style={[styles.lockedText, { fontSize: 17 }, value == null && { color: colors.muted }]}>{value ?? placeholder}</Text>
        <Text style={styles.lockIcon}>{open ? "▲" : "▼"}</Text>
      </Pressable>
      {open && (
        <View style={styles.menu}>
          {options.map((o) => (
            <Pressable key={String(o)} style={styles.menuItem} onPress={() => { setOpen(false); onChange(o); }}>
              <Text style={styles.lockedText}>{o}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * First screen: "Join us" hero (small pulsing halo, gentle float) -> tap it ->
 * experience dropdown drops in from the top -> years dropdown rises in from the bottom -> Continue.
 */
function SetupStep({ onContinue }) {
  const [started, setStarted] = useState(false);
  const [experience, setExperience] = useState(null);
  const [years, setYears] = useState(DEFAULT_YEARS);
  const [tip, setTip] = useState(false);
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const shaking = useRef(null);

  // a small, smooth wiggle while the pointer is over "Join us"
  const startShake = () => {
    shaking.current?.stop();
    shaking.current = Animated.loop(
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 90, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 180, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 90, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    shaking.current.start();
  };
  const stopShake = () => {
    shaking.current?.stop();
    Animated.timing(shake, { toValue: 0, duration: 120, useNativeDriver: true }).start();
  };

  useEffect(() => {
    const loop = (v, ms) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
    const a = loop(float, 2200);
    const b = loop(pulse, 1800);
    a.start();
    b.start();
    return () => { a.stop(); b.stop(); };
  }, []);

  return (
    <View style={styles.setup}>
      <Animated.View style={[styles.hero, { transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [-4, 4] }) }] }]}>
        <Animated.View
          style={[styles.halo, { pointerEvents: "none" }, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] }) }] }]}
        />
        <Pressable onPress={() => setStarted(true)} onHoverIn={startShake} onHoverOut={stopShake} disabled={started} accessibilityRole="button" accessibilityLabel="Join us">
          <Animated.View style={{ transform: [{ translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-3, 3] }) }, { rotate: shake.interpolate({ inputRange: [-1, 1], outputRange: ["-1.5deg", "1.5deg"] }) }] }}>
            <Text style={styles.joinUs}>Join us</Text>
          </Animated.View>
        </Pressable>
        <Pressable onPress={() => setStarted(true)} onHoverIn={startShake} onHoverOut={stopShake} disabled={started} accessibilityRole="button">
          <Text style={[styles.tagline, { textAlign: "center" }]}>{"Click here and\nsend your memories to space"}</Text>
        </Pressable>
      </Animated.View>

      {started && (
        <SlideIn from={-30} style={{ zIndex: 10, width: "90%", alignSelf: "center" }}>
          <Dropdown label="SELECT YOUR EXPERIENCE" placeholder="Select your experience" value={experience} options={EXPERIENCES} onChange={setExperience} />
        </SlideIn>
      )}

      {started && experience && (
        <SlideIn from={30} style={{ gap: spacing.sm, width: "90%", alignSelf: "center" }}>
          <View style={styles.yearsHead}>
            <Text style={styles.label}>NO OF YEARS</Text>
            <Pressable onPress={() => setTip((t) => !t)} onHoverIn={() => setTip(true)} onHoverOut={() => setTip(false)} accessibilityLabel="More info">
              <Text style={styles.info}>ⓘ</Text>
            </Pressable>
            {tip && <Text style={[styles.tooltip, { pointerEvents: "none" }]}>Your memories will be preserved for this many years.</Text>}
          </View>
          <Dropdown label="" value={years} options={YEAR_OPTIONS} onChange={setYears} />
        </SlideIn>
      )}

      {started && experience && (
        <SlideIn from={30} style={{ marginTop: "auto", width: "90%", alignSelf: "center" }}>
          <PrimaryButton title="Continue" onPress={onContinue} />
        </SlideIn>
      )}
    </View>
  );
}

/**
 * Two short steps instead of one long form (testers typed their name into the code box):
 *   1. Who are you?  — pick an astronaut, type your name.
 *   2. Your crew     — two clearly separate choices: join with a code, or create a new crew.
 * There's no host: whoever creates the crew just gets a code to share.
 */
export default function JoinScreen({ onCreate, onJoin, busy, error, initialCode, needsServer, initialServer, onServerChange, onWatchIntro }) {
  const [step, setStep] = useState(initialCode ? 1 : 0); // 0 = mission setup, 1-2 = launch sequence
  const [mode, setMode] = useState(initialCode ? "join" : null); // "join" | "create"
  const [name, setName] = useState("");
  const [crewName, setCrewName] = useState("");
  const [code, setCode] = useState(initialCode || "");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("4000");
  const [avatar, setAvatar] = useState(() => CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)].id);

  useEffect(() => {
    if (!initialServer || initialServer.origin) return;
    setIp((cur) => cur || String(initialServer.ip));
    setPort(String(initialServer.port));
  }, [initialServer]);

  useEffect(() => {
    if (needsServer) onServerChange?.({ ip: ip.trim(), port: port.trim() });
  }, [ip, port, needsServer]);

  const serverOk = !needsServer || (ip.trim() && port.trim());
  const server = needsServer ? { ip: ip.trim(), port: port.trim() } : null;
  const codeOk = code.trim().length >= 4;

  if (step === 0) return <SetupStep onContinue={() => setStep(1)} />;

  if (step === 1) {
    return (
      <View style={styles.form}>
        <Text style={styles.label}>LAUNCH SEQUENCE · STEP 1 OF 2</Text>
        <Text style={styles.title}>Select an avatar</Text>
        <Text style={styles.label}>Your avatar goes to space with memories.</Text>

        <View style={styles.avatars}>
          {CHARACTERS.map((c) => {
            const on = c.id === avatar;
            return (
              <Pressable key={c.id} onPress={() => setAvatar(c.id)} style={[styles.avatarBtn, on && { borderColor: c.suit, backgroundColor: "rgba(255,255,255,0.08)" }]}>
                <Avatar id={c.id} size={44} expr={on ? "yay" : "default"} />
              </Pressable>
            );
          })}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
          returnKeyType="next"
          onSubmitEditing={() => name.trim() && setStep(2)}
        />

        <PrimaryButton title="Next" onPress={() => setStep(2)} disabled={!name.trim()} />

      </View>
    );
  }

  return (
    <View style={styles.form}>
      <Pressable onPress={() => setStep(1)} style={styles.meRow}>
        <Avatar id={avatar} size={36} expr="yay" />
        <Text style={styles.meName}>{name.trim()}</Text>
        <Text style={styles.edit}>change</Text>
      </Pressable>

      <Text style={styles.label}>STEP 2 OF 2</Text>
      <Text style={styles.title}>Your crew</Text>

      {/* Two separate, unmistakable choices */}
      <Choice
        on={mode === "join"}
        icon="🔑"
        title="Join a crew"
        sub="Someone gave you a 6-letter code"
        onPress={() => setMode("join")}
      />
      {mode === "join" && (
        <View style={styles.expand}>
          <Text style={styles.label}>CREW CODE</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="ABC123"
            placeholderTextColor={colors.muted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            autoFocus={!initialCode}
          />
          <PrimaryButton
            title="Join crew"
            onPress={() => onJoin({ name: name.trim(), code: code.trim().toUpperCase(), server, avatar })}
            disabled={!codeOk || !serverOk}
            loading={busy}
          />
        </View>
      )}

      <Choice
        on={mode === "create"}
        icon="🚀"
        title="Create a new crew"
        sub="Start the capsule and invite your group"
        onPress={() => setMode("create")}
      />
      {mode === "create" && (
        <View style={styles.expand}>
          <Text style={styles.label}>CREW NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Studio group 4"
            placeholderTextColor={colors.muted}
            value={crewName}
            onChangeText={setCrewName}
            autoFocus
          />
          <Text style={styles.hint}>You'll get a code to share once it's made.</Text>
          <PrimaryButton title="Create crew" onPress={() => onCreate({ name: name.trim(), crewName: crewName.trim(), server, avatar })} disabled={!serverOk} loading={busy} />
        </View>
      )}

      {needsServer && (
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 2 }]} placeholder="Server IP" placeholderTextColor={colors.muted} autoCapitalize="none" value={ip} onChangeText={setIp} />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="4000" placeholderTextColor={colors.muted} keyboardType="number-pad" value={port} onChangeText={setPort} />
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function Choice({ on, icon, title, sub, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, on && styles.choiceOn]}>
      <Text style={styles.choiceIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceSub}>{sub}</Text>
      </View>
      <Text style={[styles.radio, on && styles.radioOn]}>{on ? "●" : "○"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm },
  label: { color: "#FFFFFF", fontSize: 14, letterSpacing: 1.5, fontWeight: "600" },
  title: { ...type.heading, fontSize: 28, color: "#FFFFFF" },
  lead: { color: "#C4C9E0", fontSize: 17, lineHeight: 23, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    color: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 19,
  },
  codeInput: { letterSpacing: 6, fontWeight: "800", fontSize: 22, textAlign: "center" },
  avatars: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: spacing.xs },
  avatarBtn: { width: "23%", flexGrow: 1, alignItems: "center", paddingVertical: 6, borderRadius: 12, borderWidth: 2, borderColor: "transparent" },
  setup: { flexGrow: 1, justifyContent: "flex-start", gap: spacing.lg, paddingTop: spacing.sm },
  yearsHead: { flexDirection: "row", alignItems: "center", gap: 4, zIndex: 30 },
  hero: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.md },
  halo: { position: "absolute", top: 38, left: "50%", marginLeft: -90, width: 180, height: 30, borderRadius: 15, backgroundColor: "rgba(76, 201, 240, 0.25)", boxShadow: "0 0 40px 14px rgba(76, 201, 240, 0.3)" },
  joinUs: { fontSize: 56, fontWeight: "900", color: "#FFFFFF", letterSpacing: 2, textShadowColor: colors.accent, textShadowRadius: 10, textShadowOffset: { width: 0, height: 0 } },
  tagline: { color: "#C4C9E0", fontSize: 16, marginTop: spacing.xs },
  dropBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 9 },
  menu: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, borderRadius: 10, overflow: "hidden", zIndex: 20 },
  menuItem: { paddingHorizontal: 12, paddingVertical: 11 },
  info: { color: colors.accent, fontSize: 12 },
  tooltip: { position: "absolute", top: 22, left: 0, width: 300, zIndex: 50, color: "#FFFFFF", fontSize: 13, lineHeight: 18, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: "rgba(40, 46, 80, 0.92)", boxShadow: "0 6px 18px rgba(0,0,0,0.5)" },
  lockedText: { flex: 1, color: "#FFFFFF", fontSize: 19 },
  lockIcon: { fontSize: 14 },
  meRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.xs },
  meName: { color: "#FFFFFF", fontWeight: "700", fontSize: 19 },
  edit: { color: "#FFFFFF", fontSize: 15, marginLeft: "auto" },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    borderRadius: 14,
    padding: 14,
  },
  choiceOn: { borderColor: colors.lit, backgroundColor: "rgba(255, 184, 76, 0.08)" },
  choiceIcon: { fontSize: 26 },
  choiceTitle: { color: "#FFFFFF", fontWeight: "800", fontSize: 20 },
  choiceSub: { color: "#FFFFFF", fontSize: 15, marginTop: 2 },
  radio: { color: colors.muted, fontSize: 18 },
  radioOn: { color: colors.lit },
  expand: { gap: spacing.sm, paddingHorizontal: 4, paddingBottom: spacing.sm },
  underHeading: { marginTop: -6 }, // tuck the description up against its heading
  hint: { color: "#C4C9E0", fontSize: 15 },
  row: { flexDirection: "row", gap: spacing.sm },
  error: { color: colors.danger },
});
