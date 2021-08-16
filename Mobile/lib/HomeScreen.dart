import 'package:blogify/BlogPostList.dart';
import 'package:blogify/PreviewScreen.dart';
import 'package:blogify/SelectedBlogsDrawer.dart';
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

  var isLargeScreen = false;

  @override
  Widget build(BuildContext context) {
    return OrientationBuilder(builder: (context, orientation) {
      if (MediaQuery.of(context).size.width > 600) {
        isLargeScreen = true;
      } else {
        isLargeScreen = false;
      }

      return Scaffold(
          appBar: AppBar(
            title: Text("Home"),
            actions: isLargeScreen
                ? []
                : [
                    Builder(
                      builder: (context) => IconButton(
                        icon: Icon(Icons.filter_alt_sharp),
                        onPressed: () => Scaffold.of(context).openEndDrawer(),
                        tooltip: MaterialLocalizations.of(context)
                            .openAppDrawerTooltip,
                      ),
                    ),
                  ],
          ),
          drawer: Drawer(
              // Add a ListView to the drawer. This ensures the user can scroll
              // through the options in the drawer if there isn't enough vertical
              // space to fit everything.
              child: ListView(
            // Important: Remove any padding from the ListView.
            padding: EdgeInsets.zero,
            children: <Widget>[
              DrawerHeader(
                child: Column(children: [
                  Expanded(
                      child: Text((firebaseAuth.currentUser != null)
                          ? firebaseAuth.currentUser!.displayName!
                          : "Not logged in")),
                  ElevatedButton(
                      onPressed: () async {
                        await signOut();
                      },
                      child: Text("Sign Out")),
                ]),
                decoration: BoxDecoration(
                  color: Colors.red,
                ),
              ),
              ListTile(
                title: Text('Item 1'),
                onTap: () {
                  // Update the state of the app
                  // ...
                  // Then close the drawer
                  Navigator.pop(context);
                },
              ),
              ListTile(
                title: Text('Item 2'),
                onTap: () {
                  // Update the state of the app
                  // ...
                  // Then close the drawer
                  Navigator.pop(context);
                },
              ),
            ],
          )),
          endDrawer: isLargeScreen ? null : SelectedBlogsDrawer(),
          body: Center(
              child: Row(
            children: [
              Expanded(child: BlogPostList()),
              isLargeScreen
                  ? Expanded(child: SelectedBlogsDrawer())
                  : Container()
            ],
          )),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () {
              _displayTextInputDialog();
            },
            label: Text('Add Blog'),
            icon: Icon(Icons.add),
            backgroundColor: Colors.pink,
          ));
    });
  }

  Future<void> signOut() async {
    await firebaseAuth.signOut();
    widget.refreshAuthenticationState();
  }

  Future<void> _displayTextInputDialog() async {
    String blogUrl = "";
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: Text('Add Blog'),
            content: TextField(
              onChanged: (value) {
                blogUrl = value;
              },
              autocorrect: false,
              decoration: InputDecoration(hintText: "Enter Blog URL"),
            ),
            actions: <Widget>[
              TextButton(
                child: Text('Cancel'),
                onPressed: () {
                  setState(() {
                    Navigator.pop(context);
                  });
                },
              ),
              TextButton(
                child: Text('Add'),
                onPressed: () {
                  setState(() {
                    Navigator.pop(context);
                  });

                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => PreviewScreen(blogUrl: blogUrl),
                    ),
                  );
                },
              ),
            ],
          );
        });
  }
}
