import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { withBrownStatusBar } from '../utils/screenUtils';

function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSignUp = () => {
    // TODO: Implement your own sign up logic here
    navigation.replace('Home');
  };

  const handleGuestLogin = () => {
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text>←</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <Image
              source={require('../../assets/header.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.welcomeText}>Create Account</Text>
            
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setAcceptTerms(!acceptTerms)}
                >
                  {acceptTerms && <View style={styles.checked} />}
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  I accept the terms and conditions
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.signUpButton}
                onPress={handleSignUp}
              >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.guestButton}
                onPress={handleGuestLogin}
              >
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require('../../assets/icons/google.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require('../../assets/icons/apple.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require('../../assets/icons/facebook.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                  <Text style={styles.signInText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SIZES.padding,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: SIZES.padding * 2,
    paddingBottom: SIZES.padding * 2,
  },
  header: {
    marginVertical: SIZES.padding * 0.7,
  },
  title: {
    fontSize: SIZES.fontSize.title,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  greeting: {
    fontSize: SIZES.fontSize.title,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SIZES.base,
  },
  form: {
    gap: SIZES.padding * 0.6,
    marginTop: SIZES.padding * 0.7,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.7,
    fontSize: SIZES.fontSize.body,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base,
    marginTop: SIZES.base * 0.5,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    width: 10,
    height: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  termsText: {
    flex: 1,
    fontSize: SIZES.fontSize.small,
    color: COLORS.gray,
  },
  signUpButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding * 0.7,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.padding * 0.5,
  },
  signUpButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: 'bold',
  },
  guestButton: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding * 0.7,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  guestButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.padding * 0.7,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    color: COLORS.gray,
    paddingHorizontal: SIZES.padding,
    fontSize: SIZES.fontSize.small,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.padding,
  },
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.padding * 0.7,
  },
  footerText: {
    color: COLORS.gray,
    fontSize: SIZES.fontSize.small,
  },
  signInText: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.small,
    fontWeight: 'bold',
  },
  logo: {
    width: '100%',
    height: 100,
    marginBottom: SIZES.padding * 2,
  },
  welcomeText: {
    fontSize: SIZES.fontSize.title,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SIZES.padding * 2,
  },
});

export default withBrownStatusBar(SignUpScreen); 