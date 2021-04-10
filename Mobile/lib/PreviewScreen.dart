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
        body: WebView(
          initialUrl: blogUrl,
          
        ));
  }
}
