function editUser(id){
    console.log("pre ajax");
    $.ajax({
        url: '/userHome/editProfile/' + id,
        type: 'PUT',
        data: $('#edit-profile').serialize(),
        success: function(result){
            window.location.replace("/userHome");
        }
    })
};