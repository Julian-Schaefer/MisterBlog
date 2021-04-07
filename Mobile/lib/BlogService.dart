import 'package:blogify/BlogPost.dart';
import 'package:blogify/HttpInterceptor.dart';
import 'package:http/http.dart';
import 'dart:convert';

import 'package:http_interceptor/http_client_with_interceptor.dart';

class BlogService {
  Client client = HttpClientWithInterceptor.build(interceptors: [
    HttpInterceptor(),
  ]);

  final String baseUrl = "https://blogify-api.herokuapp.com";

  Future<List<BlogPost>> fetchBlogPosts(int offset) async {
    var relativeUrl = "/blog-selection";
    if (offset > 0) {
      relativeUrl += "?offset=" + offset.toString();
    }

    final response = await client.get(Uri.parse(baseUrl + relativeUrl));

    if (response.statusCode == 200) {
      final parsedJson = jsonDecode(response.body).cast<Map<String, dynamic>>();

      return parsedJson
          .map<BlogPost>((json) => BlogPost.fromJson(json))
          .toList();
    } else {
      // If the server did not return a 200 OK response,
      // then throw an exception.
      throw Exception('Failed to load Blog Posts.');
    }
  }
}
