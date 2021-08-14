import 'package:blogify/BlogPost.dart';
import 'package:blogify/BlogPostScreen.dart';
import 'package:blogify/BlogService.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/style.dart';
import 'package:shimmer/shimmer.dart';

class BlogPostList extends StatefulWidget {
  @override
  _BlogPostListState createState() => _BlogPostListState();
}

class _BlogPostListState extends State<BlogPostList> {
  final FirebaseAuth firebaseAuth = FirebaseAuth.instance;
  late Future<List<BlogPost>> _blogPosts;

  var _scrollController = ScrollController();
  var _loadMore = false;

  @override
  void initState() {
    super.initState();
    _blogPosts = BlogService.getBlogPosts(0);

    _scrollController.addListener(() async {
      if (_scrollController.position.extentAfter <
          (MediaQuery.of(context).size.height / 3)) {
        if (!_loadMore) {
          setState(() {
            _loadMore = true;
          });
          List<BlogPost> blogPostsValue = await _blogPosts;
          List<BlogPost> newBlogPostsValue =
              await BlogService.getBlogPosts(blogPostsValue.length);
          blogPostsValue.addAll(newBlogPostsValue);
          _blogPosts = Future.value(blogPostsValue);
          setState(() {
            _loadMore = false;
          });
        }
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<BlogPost>>(
        future: _blogPosts,
        builder: (context, snapshot) {
          if (snapshot.hasError) print(snapshot.error);

          return snapshot.hasData
              ? RefreshIndicator(
                  child: ListView(
                      controller: _scrollController,
                      children: <Widget>[
                        ListView.builder(
                            itemCount: snapshot.data!.length,
                            shrinkWrap: true,
                            physics: ScrollPhysics(),
                            itemBuilder: (context, index) {
                              return BlogPostListItem(
                                  blogPost: snapshot.data![index]);
                            }),
                        if (_loadMore)
                          ListView.builder(
                              itemCount: 3,
                              shrinkWrap: true,
                              physics: ScrollPhysics(),
                              itemBuilder: (context, index) {
                                return BlogPostPlaceholder();
                              })
                      ]),
                  onRefresh: () async {
                    List<BlogPost> blogPostsValue =
                        await BlogService.getBlogPosts(0);
                    setState(() {
                      _blogPosts = Future.value(blogPostsValue);
                    });
                  })
              : ListView.builder(
                  itemCount: 6,
                  itemBuilder: (context, index) {
                    return BlogPostPlaceholder();
                  });
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
              padding: const EdgeInsets.all(16),
              child: Column(children: [
                Hero(
                    tag: "title_" + blogPost.postUrl,
                    child: Material(
                        type: MaterialType.transparency,
                        child: SizedBox(
                            width: double.infinity,
                            child: Text(
                              blogPost.title,
                              style: TextStyle(
                                  fontSize: FontSize.xLarge.size,
                                  fontWeight: FontWeight.bold),
                            )))),
                SizedBox(
                    width: double.infinity,
                    child: blogPost.authors.length == 0
                        ? Text("No author",
                            style: TextStyle(fontSize: FontSize.large.size))
                        : Row(
                            children: blogPost.authors
                                .map((e) => Text(e,
                                    style: TextStyle(
                                        fontSize: FontSize.large.size)))
                                .toList(),
                          )),
                Hero(
                    tag: "content_" + blogPost.postUrl,
                    child: Material(
                      type: MaterialType.transparency,
                      child: SizedBox(
                          width: double.infinity,
                          child: Text(
                            blogPost.summary,
                            textAlign: TextAlign.justify,
                          )),
                    ))
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

class BlogPostPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
        child: Padding(
            padding: const EdgeInsets.all(8),
            child: Container(
              width: double.infinity,
              height: 170,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              child: Column(mainAxisSize: MainAxisSize.max, children: <Widget>[
                Expanded(
                    child: Shimmer.fromColors(
                  baseColor: Colors.grey[300]!,
                  highlightColor: Colors.grey[100]!,
                  enabled: true,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Container(
                          width: 80,
                          height: 80,
                          color: Colors.white,
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Container(
                                width: MediaQuery.of(context).size.width - 210,
                                height: 24,
                                color: Colors.white,
                              ),
                              const Padding(
                                padding: EdgeInsets.symmetric(vertical: 8),
                              ),
                              Container(
                                width: double.infinity,
                                height: 16,
                                color: Colors.black,
                              ),
                              const Padding(
                                padding: EdgeInsets.symmetric(vertical: 4),
                              ),
                              Container(
                                width: MediaQuery.of(context).size.width - 170,
                                height: 16,
                                color: Colors.white,
                              ),
                              const Padding(
                                padding: EdgeInsets.symmetric(vertical: 4),
                              ),
                              Container(
                                width: MediaQuery.of(context).size.width - 150,
                                height: 16,
                                color: Colors.white,
                              ),
                              const Padding(
                                padding: EdgeInsets.symmetric(vertical: 4),
                              ),
                              Container(
                                width: 60,
                                height: 16,
                                color: Colors.white,
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ))
              ]),
            )));
  }
}
