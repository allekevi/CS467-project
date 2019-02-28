function deleteAward(id){
    $.ajax({
        url: '/manageawards' + id,
        type: "DELETE",
        success: function(result){
            window.location.reload(true);
        }
    })
};