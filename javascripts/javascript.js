var auth, firepadRef;

firepadRef = new Firebase('https://rubymen.firebaseio.com/');

auth = new FirebaseSimpleLogin(firepadRef, function(error, user) {
  var codeMirror, converter, firepad, firepadUserList, historyRef, messagesRef, userId;
  if (error) {
    return console.log(error);
  } else if (user) {
    $('#overlay').addClass('display-none');
    userId = user.username;
    firepadRef = new Firebase('https://rubymen.firebaseio.com/');
    $('#nameInput').val(userId);
    codeMirror = CodeMirror(document.getElementById('firepad'), {
      lineWrapping: true
    });
    converter = new Showdown.converter();
    firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, {
      richTextToolbar: false,
      richTextShortcuts: false,
      userId: userId
    });
    $('#addImageBtn').on('click', function() {
      firepad.setText(firepad.getText() + '![' + $('#displayImageLabelInput').val() + '](' + $('#displayImageUrlInput').val() + ')');
      return $('#imageModal').modal('hide');
    });
    $('#addLinkBtn').on('click', function() {
      firepad.setText(firepad.getText() + '[' + $('#displayLinkLabelInput').val() + '](' + $('#displayLinkUrlInput').val() + ')');
      return $('#linkModal').modal('hide');
    });
    historyRef = new Firebase('https://rubymen.firebaseio.com/history/');
    firepadUserList = FirepadUserList.fromDiv(firepadRef.child('users'), document.getElementById('userlist'), userId);
    firepad.on('ready', function() {
      if (firepad.isHistoryEmpty()) {
        firepad.setText('# Ready to markdown!');
      }
      historyRef.on('child_added', function(childSnapshot, prevChildName) {
        var s;
        $('#preview').html(converter.makeHtml(firepad.getText()));
        s = firepad.getText();
        s = s.replace(/(^\s*)|(\s*$)/gi, "");
        s = s.replace(/[ ]{2,}/gi, " ");
        s = s.replace(/\n /, "\n");
        $('#nb_ch').html(firepad.getText().length);
        return $('#nb_words').html(s.split(' ').length);
      });
    });
    messagesRef = new Firebase('https://rubymen.firebaseio.com/chat/');
    $('#messageInput').keypress(function(e) {
      var name, text;
      if (e.keyCode === 13) {
        name = userId;
        text = $('#messageInput').val();
        messagesRef.push({
          name: name,
          text: text
        });
        $('#messageInput').val('');
      }
    });
    return messagesRef.limit(10).on('child_added', function(snapshot) {
      var message;
      message = snapshot.val();
      if (message.name === userId) {
        $('<div/>').text(message.text).addClass('col-lg-8 col-lg-offset-4 bordered-row text-right').appendTo($('#messagesDiv'));
        $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
      } else {
        $('<div/>').text(message.text).addClass('col-lg-8 bordered-row').prepend($('<b/>').text(message.name + ': ')).appendTo($('#messagesDiv'));
        return $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
      }
    });
  } else {
    $('#overlay').removeClass('display-none');
    return auth.login('github');
  }
});
