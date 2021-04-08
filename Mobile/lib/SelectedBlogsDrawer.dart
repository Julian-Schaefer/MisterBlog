import 'package:blogify/BlogService.dart';
import 'package:blogify/SelectedBlog.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class SelectedBlogsDrawer extends StatefulWidget {
  @override
  _SelectedBlogsDrawerState createState() => _SelectedBlogsDrawerState();
}

class _SelectedBlogsDrawerState extends State<SelectedBlogsDrawer> {
  late Future<List<SelectedBlog>> _selectedBlogs;

  @override
  void initState() {
    super.initState();

    _selectedBlogs = BlogService.getSelectedBlogs();
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
        // Add a ListView to the drawer. This ensures the user can scroll
        // through the options in the drawer if there isn't enough vertical
        // space to fit everything.
        child: FutureBuilder<List<SelectedBlog>>(
            future: _selectedBlogs,
            builder: (context, snapshot) {
              if (snapshot.hasError) print(snapshot.error);

              return snapshot.hasData
                  ? ListView.builder(
                      itemCount: snapshot.data!.length,
                      itemBuilder: (context, index) {
                        return Row(children: [
                          Checkbox(
                              value: snapshot.data![index].selected,
                              onChanged: (bool? value) {
                                snapshot.data![index] = SelectedBlog(
                                    blogUrl: snapshot.data![index].blogUrl,
                                    selected: value!);
                                setState(() {
                                  _selectedBlogs = Future.value(snapshot.data!);
                                  BlogService.setSelectedBlogs(snapshot.data!);
                                });
                              }),
                          Text(snapshot.data![index].blogUrl),
                        ]);
                      },
                    )
                  : Center(child: CircularProgressIndicator());
            }));
  }
}
