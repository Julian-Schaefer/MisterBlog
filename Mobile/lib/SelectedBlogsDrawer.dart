import 'package:blogify/BlogService.dart';
import 'package:blogify/SelectedBlog.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/style.dart';

class SelectedBlogsDrawer extends StatefulWidget {
  @override
  _SelectedBlogsDrawerState createState() => _SelectedBlogsDrawerState();

  final VoidCallback onSelectedBlogsChanged;

  SelectedBlogsDrawer({
    required this.onSelectedBlogsChanged,
  });
}

class _SelectedBlogsDrawerState extends State<SelectedBlogsDrawer> {
  static final List _colors = [
    Colors.red,
    Colors.green,
    Colors.yellow,
    Colors.blue,
    Colors.brown,
    Colors.deepOrange,
    Colors.lime,
    Colors.purpleAccent,
    Colors.grey
  ];

  late Future<List<SelectedBlog>> _selectedBlogs;

  @override
  void initState() {
    super.initState();

    _selectedBlogs = BlogService.getSelectedBlogs();
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
        child: FutureBuilder<List<SelectedBlog>>(
            future: _selectedBlogs,
            builder: (context, snapshot) {
              if (snapshot.hasError) print(snapshot.error);

              return snapshot.hasData
                  ? Column(
                      children: [
                        SizedBox(
                          height: 80.0,
                          child: new DrawerHeader(
                              child: new Text(
                                'Selected Blogs',
                                style:
                                    TextStyle(fontSize: FontSize.xLarge.size),
                              ),
                              margin: EdgeInsets.zero,
                              padding: EdgeInsets.zero),
                        ),
                        Expanded(
                          child: ListView.builder(
                            padding: EdgeInsets.zero,
                            itemCount: snapshot.data!.length,
                            itemBuilder: (context, index) {
                              return Row(children: [
                                Checkbox(
                                    value: snapshot.data![index].isSelected,
                                    activeColor: _colors[index],
                                    onChanged: (bool? value) async {
                                      snapshot.data![index] = SelectedBlog(
                                          blogUrl:
                                              snapshot.data![index].blogUrl,
                                          isSelected: value!);

                                      await BlogService.setSelectedBlogs(
                                          snapshot.data!);
                                      setState(() {
                                        _selectedBlogs =
                                            Future.value(snapshot.data!);
                                      });
                                      widget.onSelectedBlogsChanged();
                                    }),
                                Text(snapshot.data![index].blogUrl),
                              ]);
                            },
                          ),
                        ),
                      ],
                    )
                  : Center(child: CircularProgressIndicator());
            }));
  }
}
