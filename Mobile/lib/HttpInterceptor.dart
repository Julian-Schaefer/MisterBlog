import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:http_interceptor/http_interceptor.dart';

class HttpInterceptor implements InterceptorContract {
  @override
  Future<RequestData> interceptRequest({required RequestData data}) async {
    User? currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser == null) {
      throw Exception("User is not logged in.");
    }

    var token = await currentUser.getIdToken();
    data.headers["Authorization"] = "Bearer " + token;

    return data;
  }

  @override
  Future<ResponseData> interceptResponse({required ResponseData data}) async {
    // if (data.headers != null &&
    //     data.headers!["Content-Type"] != null &&
    //     data.headers!["Content-Type"]!.startsWith("application/json")) {
    //   data.headers!["Content-Type"] = "application/json; charset=utf-8";
    // }

    if (data.body != null) {
      data.body = utf8.decode(data.body!.runes.toList());
    }

    return data;
  }
}
