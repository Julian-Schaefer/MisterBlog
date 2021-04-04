import 'package:flutter/material.dart';

// Import the firebase_core plugin
import 'package:firebase_core/firebase_core.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(App());
}

class App extends StatelessWidget {
  // Create the initialization Future outside of `build`:
  final Future<FirebaseApp> _initialization = Firebase.initializeApp();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      // Initialize FlutterFire:
      future: _initialization,
      builder: (context, snapshot) {
        // Check for errors
        if (snapshot.hasError) {
          return MaterialApp(
              home: Scaffold(
            // use Scaffold also in order to provide material app widgets
            body: Center(child: Text("Error")),
          ));
        }

        // Once complete, show your application
        if (snapshot.connectionState == ConnectionState.done) {
          return MaterialApp(
              home: Scaffold(
            // use Scaffold also in order to provide material app widgets
            body: Center(child: Text("Connected")),
          ));
        }

        // Otherwise, show something whilst waiting for initialization to complete
        return MaterialApp(
            home: Scaffold(
          // use Scaffold also in order to provide material app widgets
          body: Center(child: Text("Loading..")),
        ));
      },
    );
  }
}
