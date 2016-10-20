//=========================================================
// CLIENT
// note: the framework for this file was based on a ajax/knockout tutorial
// found here (because otherwise I would be totally lost):
// https://blog.miguelgrinberg.com/post/writing-a-javascript-rest-client
//=========================================================



function TasksViewModel(){
    var self = this;
    self.tasksURI = 'http://localhost:5000/todo/api/v1.0/tasks'
    self.tasks = ko.observableArray();

    self.tasks([
        {
            title: ko.observable('title #1'),
            description: ko.observable('description #1'),
        },
        {
            title: ko.observable('title #2'),
            description: ko.observable('description #2'),
        }
    ]);

    //=========================================================
    // BUTTONS
    //=========================================================
    self.login = function(){
        alert("login");
    }

    self.beginAdd = function() {
        alert("Add");
        self.ajax(self.tasksURI, 'POST', task).done(function(data) {
            self.tasks.push({
                uri: ko.observable(data.task.uri),
                title: ko.observable(data.task.title),
                description: ko.observable(data.task.description),
                done: ko.observable(data.task.done)
            });
        });
    }

    self.beginEdit = function(task) {
        editTaskViewModel.setTask(task);
        $('#edit').modal('show');
    }

    self.edit = function(task, data) {
        self.ajax(task.uri(), 'PUT', data).done(function(res) {
            self.updateTask(task, res.task);
        });
    }

    self.updateTask = function(task, newTask) {
        var i = self.tasks.indexOf(task);
        self.tasks()[i].uri(newTask.uri);
        self.tasks()[i].title(newTask.title);
        self.tasks()[i].description(newTask.description);
        self.tasks()[i].done(newTask.done);
    }

    self.remove = function(task) {
        self.ajax(task.uri(), 'DELETE').done(function() {
            self.tasks.remove(task);
        });
    }

    //=========================================================
    // AJAX
    //=========================================================
    self.ajax = function(uri, method, data) {
            var request = {
                url: uri,
                type: method,
                contentType: "application/json",
                accepts: "application/json",
                cache: false,
                dataType: 'json',
                data: JSON.stringify(data),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", 
                        "Basic " + btoa(self.username + ":" + self.password));
                    console.log("AJAX CALLED")
                },
                error: function(jqXHR) {
                    console.log("ajax error " + jqXHR.status);
                }
            };
            return $.ajax(request);
    }

    self.ajax(self.tasksURI, 'GET').done(function(data) {

        for (var i = 0; i < data.tasks.length; i++) {
            self.tasks.push({
                uri: ko.observable(data.tasks[i].uri),
                title: ko.observable(data.tasks[i].title),
                description: ko.observable(data.tasks[i].description),
            });
        }
    });

    //=========================================================
    // LOGIN
    //=========================================================
    self.beginLogin = function() {
            //$('#login').modal('show');
    }
    
    self.login = function(username, password) {
        self.username = username;
        self.password = password;
        self.ajax(self.tasksURI, 'GET').done(function(data) {
            for (var i = 0; i < data.tasks.length; i++) {
                self.tasks.push({
                    uri: ko.observable(data.tasks[i].uri),
                    title: ko.observable(data.tasks[i].title),
                    description: ko.observable(data.tasks[i].description),
                    done: ko.observable(data.tasks[i].done)
                });
            }
        }).fail(function(jqXHR) {
            if (jqXHR.status == 403)
                setTimeout(self.beginLogin, 500);
            });
    }
}

var tasksViewModel = new TasksViewModel();
var addTaskViewModel = new AddTaskViewModel();
ko.applyBindings(tasksViewModel, $('#main')[0]);
ko.applyBindings(addTaskViewModel, $('#add')[0]);

//=========================================================
// ADD NEW TASK
//=========================================================
function AddTaskViewModel() {
    var self = this;
    self.title = ko.observable();
    self.description = ko.observable();

    self.add = function() {
        $('#add').modal('hide');
        tasksViewModel.add({
            title: self.title(),
            description: self.description()
        });
        self.title("");
        self.description("");
    }
}

//=========================================================
// EDIT TASK
//=========================================================
function EditTaskViewModel() {
    var self = this;
    self.title = ko.observable();
    self.description = ko.observable();

    self.setTask = function(task) {
        self.task = task;
        self.title(task.title());
        self.description(task.description());
        $('edit').modal('show');
    }
    self.editTask = function() {
        $('#edit').modal('hide');
        tasksViewModel.edit(self.task, {
            title: self.title(),
            description: self.description() ,
            done: self.done()
        });
    }
}

//=========================================================
// LOGIN
//=========================================================
function LoginViewModel(username,password) {
    var self = this;
    //self.username = ko.observable();
    //self.password = ko.observable();
    self.username = username;
    self.password = password;

    self.login = function() {
        $('#login').modal('hide');
        tasksViewModel.login(self.username(), self.password());
    }
}