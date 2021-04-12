import 'dart:math' as math;
import 'package:blogify/BlogPost.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_html/style.dart';

class BlogPostScreen extends StatelessWidget {
  final BlogPost blogPost;

  BlogPostScreen({Key? key, required this.blogPost}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(slivers: <Widget>[
        SliverAppBar(
          pinned: true,
          snap: false,
          floating: true,
          expandedHeight: 190.0,
          flexibleSpace: _MyAppSpace(
            blogPost: blogPost,
          ),
          // FlexibleSpaceBar(
          //   title: RichText(
          //     text: TextSpan(children: [
          //       TextSpan(text: blogPost.title, style: TextStyle(fontSize: 16.5))
          //     ]),
          //   ),
          //   centerTitle: false,
          //   background: FlutterLogo(),
          // ),
          actions: [
            IconButton(
              icon: Icon(Icons.refresh),
              onPressed: () {},
            ),
            IconButton(
              icon: Icon(Icons.search),
              onPressed: () {},
            )
          ],
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

class _MyAppSpace extends StatelessWidget {
  final BlogPost blogPost;

  _MyAppSpace({Key? key, required this.blogPost}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, c) {
        final settings = context
            .dependOnInheritedWidgetOfExactType<FlexibleSpaceBarSettings>()!;
        final deltaExtent = settings.maxExtent - settings.minExtent;
        final t =
            (1.0 - (settings.currentExtent - settings.minExtent) / deltaExtent)
                .clamp(0.0, 1.0);
        final fadeStart = math.max(0.0, 1.0 - kToolbarHeight / deltaExtent);
        const fadeEnd = 1.0;
        final opacity = 1.0 - Interval(fadeStart, fadeEnd).transform(t);

        return Stack(
          children: [
            SafeArea(
              child: Padding(
                padding: EdgeInsets.only(top: 16.5, left: 64, right: 90),
                child: Opacity(
                    opacity: 1 - opacity,
                    child: Text(
                      blogPost.title,
                      textAlign: TextAlign.left,
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: FontSize.xLarge.size,
                          fontWeight: FontWeight.w500),
                      overflow: TextOverflow.ellipsis,
                    )),
              ),
            ),
            Opacity(
              opacity: opacity,
              child: Stack(
                alignment: Alignment.bottomLeft,
                children: [
                  getImage(),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      blogPost.title,
                      textAlign: TextAlign.left,
                      maxLines: 4,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 26.0,
                        fontWeight: FontWeight.w500,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  )
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget getImage() {
    return Container(
      width: double.infinity,
      child: Image.network(
        'https://source.unsplash.com/daily?code',
        fit: BoxFit.cover,
      ),
    );
  }
}
