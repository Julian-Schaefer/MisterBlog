import 'package:blogify/BlogPostList.dart';
import 'package:blogify/SelectedBlog.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import 'BlogService.dart';

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
    return Scaffold(
        appBar: AppBar(
          title: Text("Home"),
          actions: [
            Builder(
              builder: (context) => IconButton(
                icon: Icon(Icons.filter_alt_sharp),
                onPressed: () => Scaffold.of(context).openEndDrawer(),
                tooltip: MaterialLocalizations.of(context).openAppDrawerTooltip,
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
        endDrawer: Drawer(

            // Add a ListView to the drawer. This ensures the user can scroll
            // through the options in the drawer if there isn't enough vertical
            // space to fit everything.
            child: FutureBuilder<List<SelectedBlog>>(
                future: BlogService.getSelectedBlogs(),
                builder: (context, snapshot) {
                  if (snapshot.hasError) print(snapshot.error);

                  return snapshot.hasData
                      ? ListView.builder(
                          itemCount: snapshot.data!.length,
                          itemBuilder: (context, index) {
                            return ListTile(
                              title: Text(snapshot.data![index].blogUrl),
                              onTap: () {
                                // Update the state of the app
                                // ...
                                // Then close the drawer
                                Navigator.pop(context);
                              },
                            );
                          })
                      : Center(child: CircularProgressIndicator());
                })),
        body: Center(child: BlogPostList()));
  }

  Future<void> signOut() async {
    await firebaseAuth.signOut();
    widget.refreshAuthenticationState();
  }
}
