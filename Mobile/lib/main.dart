import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

// Import the firebase_core plugin
import 'package:firebase_core/firebase_core.dart';
import 'package:google_sign_in/google_sign_in.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(App());
}

class App extends StatelessWidget {
  final Future<FirebaseApp> _initialization = Firebase.initializeApp();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        home: Scaffold(
            appBar: AppBar(title: Text("Blogify")),
            body: FutureBuilder(
              // Initialize FlutterFire:
              future: _initialization,
              builder: (context, snapshot) {
                // Check for errors
                if (snapshot.hasError) {
                  return Center(child: Text("Error"));
                }

                // Once complete, show your application
                if (snapshot.connectionState == ConnectionState.done) {
                  final FirebaseAuth firebaseAuth = FirebaseAuth.instance;
                  return Center(
                      child: Column(
                    children: [
                      MaterialButton(
                          onPressed: () {
                            signInWithGoogle();
                          },
                          child: Text("Sign In with Google")),
                      Text((firebaseAuth.currentUser != null)
                          ? firebaseAuth.currentUser!.displayName!
                          : "Not logged in"),
                    ],
                  ));
                }

                // Otherwise, show something whilst waiting for initialization to complete
                return Center(child: Text("Loading.."));
              },
            )));
  }

  void signInWithGoogle() async {
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
    await FirebaseAuth.instance.signInWithCredential(credential);
  }
}
