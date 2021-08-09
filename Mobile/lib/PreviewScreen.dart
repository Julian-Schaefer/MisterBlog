import 'package:blogify/BlogService.dart';
import 'package:blogify/SelectedBlog.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PreviewScreen extends StatelessWidget {
  final String blogUrl;

  PreviewScreen({Key? key, required this.blogUrl}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text("Add Blog"),
        ),
        body: WebView(initialUrl: blogUrl),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () {
            _addSelectedBlog(context);
          },
          label: Text('Confirm'),
          icon: Icon(Icons.add),
          backgroundColor: Colors.pink,
        ));
  }

  Future<void> _addSelectedBlog(BuildContext context) async {
    try {
      await BlogService.addSelectedBlog(
          SelectedBlog(blogUrl: blogUrl, isSelected: true));

      Navigator.pop(context);
    } catch (e) {
      print("Could not add new selected Blog");
    }
  }
}
