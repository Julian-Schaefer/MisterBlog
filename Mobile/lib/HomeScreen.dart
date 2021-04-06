import 'package:blogify/BlogPostList.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class HomeScreen extends StatefulWidget {
  final void Function() refreshAuthenticationState;

  const HomeScreen({Key? key, required this.refreshAuthenticationState})
      : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final FirebaseAuth firebaseAuth = FirebaseAuth.instance;

  @override
  Widget build(BuildContext context) {
    return Center(
        child: Column(
      children: [
        Text((firebaseAuth.currentUser != null)
            ? firebaseAuth.currentUser!.displayName!
            : "Not logged in"),
        MaterialButton(
            onPressed: () async {
              await signOut();
            },
            child: Text("Sign Out")),
        Expanded(child: BlogPostList())
      ],
    ));
  }

  Future<void> signOut() async {
    await firebaseAuth.signOut();
    widget.refreshAuthenticationState();
  }
}
