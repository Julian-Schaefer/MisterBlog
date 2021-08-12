import 'package:blogify/HomeScreen.dart';
import 'package:blogify/SignInScreen.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

// Import the firebase_core plugin
import 'package:firebase_core/firebase_core.dart';

import 'SignInScreen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(App());
}

class App extends StatelessWidget {
  final Future<FirebaseApp> _initialization = Firebase.initializeApp();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        home: FutureBuilder(
      // Initialize FlutterFire:
      future: _initialization,
      builder: (context, snapshot) {
        // Check for errors
        if (snapshot.hasError) {
          return Scaffold(
              appBar: AppBar(title: Text("Blogify")),
              body:
                  Center(child: Text("Error: " + snapshot.error!.toString())));
        }

        // Once complete, show your application
        if (snapshot.connectionState == ConnectionState.done) {
          return AuthenticationScreen();
        }

        // Otherwise, show something whilst waiting for initialization to complete
        return Scaffold(
            appBar: AppBar(title: Text("Blogify")),
            body: Center(child: Text("Loading..")));
      },
    ));
  }
}

class AuthenticationScreen extends StatefulWidget {
  @override
  _AuthenticationScreenState createState() => _AuthenticationScreenState();
}

class _AuthenticationScreenState extends State<AuthenticationScreen> {
  _AuthenticationScreenState() {
    FirebaseAuth.instance.authStateChanges().listen((User? _) {
      this.refreshAuthenticationState();
    });
  }

  void refreshAuthenticationState() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return (FirebaseAuth.instance.currentUser != null)
        ? HomeScreen(
            refreshAuthenticationState: this.refreshAuthenticationState)
        : SignInScreen(
            refreshAuthenticationState: this.refreshAuthenticationState);
  }
}
