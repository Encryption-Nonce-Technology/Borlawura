import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors, { Brand } from "@/constants/colors";
import { saveSession } from "@/lib/session";
import { trpc } from "@/lib/trpc";

const roleLabels: Record<"user" | "collector" | "admin", string> = {
  user: "I need pickup",
  collector: "I collect waste",
  admin: "I manage operations",
};

export default function LoginScreen() {
  const initialRoleParam = useLocalSearchParams().role as
    | "user"
    | "collector"
    | "admin"
    | undefined;
  const [phone, setPhone] = useState("+233");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<"user" | "collector" | "admin">(initialRoleParam ?? "user");
  const [otpRequested, setOtpRequested] = useState(false);
  const requestOtp = trpc.auth.requestOtp.useMutation({
    onSuccess: (data) => {
      setOtpRequested(true);
      Alert.alert("OTP sent", data.codeForDev ? `Development code: ${data.codeForDev}` : "Check your SMS.");
    },
    onError: (error) => Alert.alert("Could not send OTP", error.message),
  });
  const verifyOtp = trpc.auth.verifyOtp.useMutation({
    onSuccess: async (data) => {
      await saveSession({ token: data.token, user: data.user! as any });
      router.replace("/" as any);
    },
    onError: (error) => Alert.alert("Could not sign in", error.message),
  });
  const pending = requestOtp.isPending || verifyOtp.isPending;
  const submit = () => {
    if (!otpRequested) {
      requestOtp.mutate({ phone });
      return;
    }
    const name =
      role === "collector" ? "New Collector" : role === "admin" ? "Administrator" : "Borlawura User";
    verifyOtp.mutate({ phone, code: otp, role, name });
  };

  return <SafeAreaView style={styles.page}><View style={styles.hero}><Image source={require("@/assets/images/icon.png")} style={styles.logo} /><Text style={styles.title}>{Brand.appName}</Text><Text style={styles.subtitle}>Waste pickup made simple.</Text></View><View style={styles.card}><Text style={styles.heading}>{otpRequested ? "Verify your number" : "Sign in"}</Text><Text style={styles.help}>Use your Ghana phone number to securely access your account.</Text><TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+233 24 000 0000" />{!otpRequested && (
<View style={styles.roleRow}>
  {(["user", "collector", "admin"] as const).map((item) => (
    <Pressable key={item} onPress={() => setRole(item)} style={[styles.role, role === item && styles.roleActive]}>
      <Text style={[styles.roleText, role === item && styles.roleTextActive]}>{roleLabels[item]}</Text>
    </Pressable>
  ))}
</View>
)}{otpRequested && <TextInput style={styles.input} value={otp} onChangeText={setOtp} keyboardType="number-pad" placeholder="6-digit OTP" maxLength={6} />}<Pressable style={[styles.button, pending && styles.disabled]} onPress={submit} disabled={pending || phone.length < 10 || (otpRequested && otp.length !== 6)}><Text style={styles.buttonText}>{pending ? "Please wait..." : otpRequested ? "Verify and continue" : "Send OTP"}</Text></Pressable></View></SafeAreaView>;
}

const styles = StyleSheet.create({ page:{flex:1,backgroundColor:"#F7FAF9",padding:24,justifyContent:"center"},hero:{alignItems:"center",marginBottom:34},logo:{width:76,height:76,borderRadius:38,marginBottom:12},title:{fontSize:32,fontWeight:"800",color:Colors.light.text},subtitle:{color:Colors.light.muted,marginTop:6},card:{backgroundColor:"#fff",borderRadius:20,padding:22,gap:14,elevation:2},heading:{fontSize:24,fontWeight:"700",color:Colors.light.text},help:{color:Colors.light.muted,lineHeight:20},input:{borderWidth:1,borderColor:Colors.light.border,borderRadius:12,padding:14,fontSize:16,color:Colors.light.text},roleRow:{flexDirection:"row",gap:10},role:{flex:1,borderWidth:1,borderColor:Colors.light.border,padding:12,borderRadius:12,alignItems:"center"},roleActive:{borderColor:Colors.light.primary,backgroundColor:"#ECFDF5"},roleText:{fontSize:12,color:Colors.light.muted,fontWeight:"600"},roleTextActive:{color:Colors.light.primaryDark},button:{backgroundColor:Colors.light.primary,borderRadius:12,padding:16,alignItems:"center"},disabled:{opacity:.55},buttonText:{color:"#fff",fontWeight:"700",fontSize:16} });
