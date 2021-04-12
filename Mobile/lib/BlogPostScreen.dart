import 'package:blogify/BlogPost.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';

class BlogPostScreen extends StatelessWidget {
  final BlogPost blogPost;

  BlogPostScreen({Key? key, required this.blogPost}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(slivers: <Widget>[
        SliverAppBar(
          pinned: false,
          snap: false,
          floating: true,
          expandedHeight: 160.0,
          flexibleSpace: FlexibleSpaceBar(
            title: Text(blogPost.title),
            background: FlutterLogo(),
          ),
        ),
        SliverToBoxAdapter(
            child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Html(
                  data: blogPost.content,
                )))
      ]),
    );
  }
}
