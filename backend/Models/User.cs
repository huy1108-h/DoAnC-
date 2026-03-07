using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("users")]
public class User
{
    [Key]
    [Column("user_name")]
    public string UserName { get; set; }

    [Column("hashPass")]
    public string HashPass { get; set; }

    [Column("user_role")]
    public string UserRole { get; set; }

    [Column("email")]
    public string Email { get; set; }

    [Column("phone")]
    public int Phone { get; set; }
}