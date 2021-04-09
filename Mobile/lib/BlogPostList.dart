import 'package:blogify/BlogPost.dart';
import 'package:blogify/BlogPostScreen.dart';
import 'package:blogify/BlogService.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/style.dart';

class BlogPostList extends StatefulWidget {
  @override
  _BlogPostListState createState() => _BlogPostListState();
}

class _BlogPostListState extends State<BlogPostList> {
  final FirebaseAuth firebaseAuth = FirebaseAuth.instance;

  @override
  void initState() {
    super.initState();
    BlogService.getBlogPosts(0);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<BlogPost>>(
        future: BlogService.getBlogPosts(0),
        builder: (context, snapshot) {
          if (snapshot.hasError) print(snapshot.error);

          return snapshot.hasData
              ? ListView.builder(
                  itemCount: snapshot.data!.length,
                  itemBuilder: (context, index) {
                    return BlogPostListItem(blogPost: snapshot.data![index]);
                  })
              : Center(child: CircularProgressIndicator());
        });
  }
}

class BlogPostListItem extends StatelessWidget {
  final BlogPost blogPost;

  const BlogPostListItem({Key? key, required this.blogPost}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
        child: Card(
            child: InkWell(
          child: Padding(
              padding: const EdgeInsets.all(8),
              child: Column(children: [
                Text(
                  blogPost.title,
                  style: TextStyle(
                      fontSize: FontSize.xLarge.size,
                      fontWeight: FontWeight.bold),
                ),
                Text(
                  blogPost.author,
                  textAlign: TextAlign.left,
                  style: TextStyle(fontSize: FontSize.large.size),
                ),
                Text(blogPost.introduction)
              ])),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => BlogPostScreen(blogPost: blogPost),
              ),
            );
          },
        )));
  }
}
