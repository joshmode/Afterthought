"""Align production constraints with the ORM metadata.

Revision ID: 9c2f7a8e4b10
Revises: e73a0d4bb811
Create Date: 2026-07-28
"""

from alembic import op


revision = "9c2f7a8e4b10"
down_revision = "e73a0d4bb811"
branch_labels = None
depends_on = None


def _replace_fk(
    table: str,
    constraint: str,
    local_column: str,
    remote_table: str,
    *,
    ondelete: str,
) -> None:
    op.drop_constraint(constraint, table, type_="foreignkey")
    op.create_foreign_key(
        constraint,
        table,
        remote_table,
        [local_column],
        ["id"],
        ondelete=ondelete,
    )


def upgrade() -> None:
    op.alter_column("essay_themes", "essay_id", nullable=False)
    op.alter_column("essay_themes", "theme_id", nullable=False)
    op.drop_constraint("uq_essay_themes_essay_theme", "essay_themes", type_="unique")
    op.create_primary_key("pk_essay_themes", "essay_themes", ["essay_id", "theme_id"])

    for table, column in (
        ("essay_versions", "created_at"),
        ("essays", "created_at"),
        ("notifications", "created_at"),
        ("reading_history", "last_read_at"),
        ("series", "created_at"),
        ("submissions", "created_at"),
        ("users", "created_at"),
    ):
        op.execute(f"UPDATE {table} SET {column} = now() WHERE {column} IS NULL")
        op.alter_column(table, column, nullable=False)

    for table, constraint, column, remote, ondelete in (
        ("essay_themes", "essay_themes_essay_id_fkey", "essay_id", "essays", "CASCADE"),
        ("essay_themes", "essay_themes_theme_id_fkey", "theme_id", "themes", "CASCADE"),
        ("essay_versions", "essay_versions_essay_id_fkey", "essay_id", "essays", "CASCADE"),
        (
            "essay_versions",
            "essay_versions_created_by_id_fkey",
            "created_by_id",
            "users",
            "SET NULL",
        ),
        ("essays", "essays_author_id_fkey", "author_id", "users", "SET NULL"),
        ("essays", "essays_series_id_fkey", "series_id", "series", "SET NULL"),
        ("notifications", "notifications_user_id_fkey", "user_id", "users", "CASCADE"),
        (
            "reading_history",
            "reading_history_essay_id_fkey",
            "essay_id",
            "essays",
            "CASCADE",
        ),
        (
            "reading_history",
            "reading_history_user_id_fkey",
            "user_id",
            "users",
            "CASCADE",
        ),
        (
            "user_preferences",
            "user_preferences_user_id_fkey",
            "user_id",
            "users",
            "CASCADE",
        ),
    ):
        _replace_fk(table, constraint, column, remote, ondelete=ondelete)


def downgrade() -> None:
    for table, constraint, column, remote in (
        ("essay_themes", "essay_themes_essay_id_fkey", "essay_id", "essays"),
        ("essay_themes", "essay_themes_theme_id_fkey", "theme_id", "themes"),
        ("essay_versions", "essay_versions_essay_id_fkey", "essay_id", "essays"),
        ("essay_versions", "essay_versions_created_by_id_fkey", "created_by_id", "users"),
        ("essays", "essays_author_id_fkey", "author_id", "users"),
        ("essays", "essays_series_id_fkey", "series_id", "series"),
        ("notifications", "notifications_user_id_fkey", "user_id", "users"),
        ("reading_history", "reading_history_essay_id_fkey", "essay_id", "essays"),
        ("reading_history", "reading_history_user_id_fkey", "user_id", "users"),
        ("user_preferences", "user_preferences_user_id_fkey", "user_id", "users"),
    ):
        op.drop_constraint(constraint, table, type_="foreignkey")
        op.create_foreign_key(constraint, table, remote, [column], ["id"])

    for table, column in (
        ("essay_versions", "created_at"),
        ("essays", "created_at"),
        ("notifications", "created_at"),
        ("reading_history", "last_read_at"),
        ("series", "created_at"),
        ("submissions", "created_at"),
        ("users", "created_at"),
    ):
        op.alter_column(table, column, nullable=True)

    op.drop_constraint("pk_essay_themes", "essay_themes", type_="primary")
    op.create_unique_constraint(
        "uq_essay_themes_essay_theme",
        "essay_themes",
        ["essay_id", "theme_id"],
    )
    op.alter_column("essay_themes", "essay_id", nullable=True)
    op.alter_column("essay_themes", "theme_id", nullable=True)
