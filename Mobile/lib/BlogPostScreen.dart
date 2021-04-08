import 'package:blogify/BlogPost.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';

class BlogPostScreen extends StatelessWidget {
  final BlogPost blogPost;

  BlogPostScreen({Key? key, required this.blogPost}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(blogPost.title),
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: SingleChildScrollView(
            child: Html(
          data: blogPost.content,
        )),
      ),
    );
  }
}
