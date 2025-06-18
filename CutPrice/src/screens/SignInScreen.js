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

function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // TODO: Implement your own authentication logic here
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

            <Text style={styles.welcomeText}>Welcome Back!</Text>
            
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Name Or Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity onPress={() => {/* TODO: Implement forgot password */}}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.signInButton}
                onPress={handleSignIn}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
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
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.signUpText}>Sign Up</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding * 2,
    paddingBottom: SIZES.padding * 2,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: SIZES.padding,
  },
  welcomeText: {
    fontSize: SIZES.fontSize.title,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.padding,
  },
  form: {
    gap: SIZES.padding * 0.7,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.8,
    fontSize: SIZES.fontSize.body,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: COLORS.gray,
    fontSize: SIZES.fontSize.small,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding * 0.8,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.padding * 0.5,
  },
  signInButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: 'bold',
  },
  guestButton: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding * 0.8,
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
  signUpText: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.small,
    fontWeight: 'bold',
  },
});

export default withBrownStatusBar(SignInScreen); 