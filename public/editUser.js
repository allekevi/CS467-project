function editUser(id){
    $.ajax({
        url: '/userHome/editProfile/' + id,
        type: 'PUT',
        data: $('#edit-profile').serialize(),
        success: function(result){
           window.location.replace('./')
        }
    })
};