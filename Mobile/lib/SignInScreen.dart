import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

// Import the firebase_core plugin
import 'package:google_sign_in/google_sign_in.dart';

class SignInScreen extends StatefulWidget {
  @override
  _SignInScreenState createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final FirebaseAuth firebaseAuth = FirebaseAuth.instance;

  @override
  Widget build(BuildContext context) {
    return Center(
        child: Column(
      children: [
        MaterialButton(
            onPressed: () async {
              await signInWithGoogle();
            },
            child: Text("Sign In with Google")),
        Text((firebaseAuth.currentUser != null)
            ? firebaseAuth.currentUser!.displayName!
            : "Not logged in"),
        MaterialButton(
            onPressed: () async {
              await signOut();
            },
            child: Text("Sign Out")),
      ],
    ));
  }

  Future<void> signInWithGoogle() async {
    // Trigger the authentication flow
    final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
    if (googleUser == null) {
      return;
    }

    // Obtain the auth details from the request
    final GoogleSignInAuthentication googleAuth =
        await googleUser.authentication;

    // Create a new credential
    final OAuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    // Once signed in, return the UserCredential
    await firebaseAuth.signInWithCredential(credential);
    setState(() {});
  }

  Future<void> signOut() async {
    await firebaseAuth.signOut();
    setState(() {});
  }
}
