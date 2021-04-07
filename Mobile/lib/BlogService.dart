import 'dart:io';

import 'package:blogify/BlogPost.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class BlogService {
  final String baseUrl = "https://blogify-api.herokuapp.com";

  Future<List<BlogPost>> fetchBlogPosts(int offset) async {
    var relativeUrl = "/blog-selection";
    if (offset > 0) {
      relativeUrl += "?offset=" + offset.toString();
    }

    var token = await FirebaseAuth.instance.currentUser!.getIdToken();

    final response = await http.get(Uri.parse(baseUrl + relativeUrl),
        headers: {HttpHeaders.authorizationHeader: "Bearer " + token});

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
