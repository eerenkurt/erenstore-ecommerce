using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateOrderStatusToEnum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Önce tabloları birbirini kilitlemeyecek şekilde tamamen boşaltıyoruz
            migrationBuilder.Sql("DELETE FROM \"OrderItems\";");
            migrationBuilder.Sql("DELETE FROM \"Orders\";");

            // 2. PostgreSQL'e Status kolonunu zorla integer tipine dönüştür ve içerik dönüşümü için USING kalıbını kullan de!
            migrationBuilder.Sql("ALTER TABLE \"Orders\" ALTER COLUMN \"Status\" TYPE integer USING \"Status\"::integer;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Geri alma durumunda da string'e (text) güvenle geri dönebilmesi için:
            migrationBuilder.Sql("DELETE FROM \"OrderItems\";");
            migrationBuilder.Sql("DELETE FROM \"Orders\";");
            migrationBuilder.Sql("ALTER TABLE \"Orders\" ALTER COLUMN \"Status\" TYPE text;");
        }
    }
}
