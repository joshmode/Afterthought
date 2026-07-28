"""Complete production schema and add missing engagement tables.

Revision ID: e73a0d4bb811
Revises: cac6c59432f2
Create Date: 2026-07-28 18:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e73a0d4bb811"
down_revision: Union[str, Sequence[str], None] = "cac6c59432f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "comments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("is_approved", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("is_anonymous", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("essay_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["essay_id"], ["essays.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_comments_id", "comments", ["id"])
    op.create_index("ix_comments_essay_approved", "comments", ["essay_id", "is_approved"])

    op.create_table(
        "bookmarks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("essay_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["essay_id"], ["essays.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "essay_id", name="uq_bookmarks_user_essay"),
    )
    op.create_index("ix_bookmarks_id", "bookmarks", ["id"])
    op.create_index("ix_bookmarks_user_created", "bookmarks", ["user_id", "created_at"])

    op.create_table(
        "feedback",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("category", sa.String(), server_default="general", nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(), server_default="new", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "status IN ('new', 'reviewed', 'resolved')", name="ck_feedback_status"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_feedback_id", "feedback", ["id"])
    op.create_index("ix_feedback_status_created", "feedback", ["status", "created_at"])

    op.add_column(
        "essays",
        sa.Column("view_count", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column("submissions", sa.Column("reviewer_notes", sa.Text(), nullable=True))
    op.add_column(
        "submissions", sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True)
    )

    op.execute("UPDATE users SET is_active = true WHERE is_active IS NULL")
    op.execute("UPDATE users SET is_admin = false WHERE is_admin IS NULL")
    op.execute("UPDATE users SET hide_identity = false WHERE hide_identity IS NULL")
    op.execute("UPDATE essays SET is_published = false WHERE is_published IS NULL")
    op.execute("UPDATE essays SET is_current_issue = false WHERE is_current_issue IS NULL")
    op.execute("UPDATE essays SET status = 'draft' WHERE status IS NULL")
    op.execute("UPDATE essays SET updated_at = created_at WHERE updated_at IS NULL")
    op.execute("UPDATE series SET is_active = false WHERE is_active IS NULL")
    op.execute(
        "UPDATE user_preferences SET email_notifications = true "
        "WHERE email_notifications IS NULL"
    )
    op.execute(
        "UPDATE user_preferences SET anonymous_posting = false "
        "WHERE anonymous_posting IS NULL"
    )
    op.execute(
        "UPDATE user_preferences SET font_size_preference = 'medium' "
        "WHERE font_size_preference IS NULL"
    )
    op.execute(
        "UPDATE user_preferences SET theme_preference = 'system' "
        "WHERE theme_preference IS NULL"
    )
    op.execute("UPDATE reading_history SET progress_percent = 0 WHERE progress_percent IS NULL")
    op.execute("UPDATE submissions SET status = 'pending' WHERE status IS NULL")
    op.execute("UPDATE notifications SET is_read = false WHERE is_read IS NULL")

    op.alter_column("users", "is_active", nullable=False, server_default=sa.true())
    op.alter_column("users", "is_admin", nullable=False, server_default=sa.false())
    op.alter_column("users", "hide_identity", nullable=False, server_default=sa.false())
    op.alter_column("series", "is_active", nullable=False, server_default=sa.false())
    op.alter_column("essays", "is_published", nullable=False, server_default=sa.false())
    op.alter_column("essays", "is_current_issue", nullable=False, server_default=sa.false())
    op.alter_column("essays", "status", nullable=False, server_default="draft")
    op.alter_column("essays", "updated_at", nullable=False, server_default=sa.func.now())
    op.alter_column(
        "user_preferences", "email_notifications", nullable=False, server_default=sa.true()
    )
    op.alter_column(
        "user_preferences", "anonymous_posting", nullable=False, server_default=sa.false()
    )
    op.alter_column(
        "user_preferences", "font_size_preference", nullable=False, server_default="medium"
    )
    op.alter_column(
        "user_preferences", "theme_preference", nullable=False, server_default="system"
    )
    op.alter_column(
        "reading_history", "progress_percent", nullable=False, server_default="0"
    )
    op.alter_column("submissions", "status", nullable=False, server_default="pending")
    op.alter_column("notifications", "is_read", nullable=False, server_default=sa.false())

    op.execute(
        "DELETE FROM essay_themes a USING essay_themes b "
        "WHERE a.ctid < b.ctid AND a.essay_id = b.essay_id AND a.theme_id = b.theme_id"
    )
    op.create_unique_constraint(
        "uq_essay_themes_essay_theme", "essay_themes", ["essay_id", "theme_id"]
    )
    op.execute(
        "DELETE FROM reading_history a USING reading_history b "
        "WHERE a.id < b.id AND a.user_id = b.user_id AND a.essay_id = b.essay_id"
    )
    op.create_unique_constraint(
        "uq_reading_history_user_essay",
        "reading_history",
        ["user_id", "essay_id"],
    )
    op.create_check_constraint(
        "ck_reading_history_progress",
        "reading_history",
        "progress_percent >= 0 AND progress_percent <= 100",
    )
    op.create_check_constraint(
        "ck_essays_status",
        "essays",
        "status IN ('draft', 'scheduled', 'published', 'archived')",
    )
    op.create_check_constraint(
        "ck_essays_reading_time_positive",
        "essays",
        "reading_time_minutes IS NULL OR reading_time_minutes > 0",
    )
    op.create_check_constraint(
        "ck_submissions_status",
        "submissions",
        "status IN ('pending', 'in_review', 'accepted', 'rejected')",
    )

    op.execute(
        "WITH ranked AS ("
        "SELECT id, row_number() OVER (ORDER BY publication_date DESC NULLS LAST, id DESC) AS rn "
        "FROM essays WHERE is_current_issue = true"
        ") UPDATE essays SET is_current_issue = false "
        "WHERE id IN (SELECT id FROM ranked WHERE rn > 1)"
    )
    op.create_index(
        "uq_essays_single_current",
        "essays",
        ["is_current_issue"],
        unique=True,
        postgresql_where=sa.text("is_current_issue = true"),
    )
    op.create_index(
        "ix_essays_status_publication", "essays", ["status", "publication_date"]
    )
    op.create_index("ix_essays_series_id", "essays", ["series_id"])
    op.create_index("ix_reading_history_user_last", "reading_history", ["user_id", "last_read_at"])
    op.create_index("ix_notifications_user_read", "notifications", ["user_id", "is_read"])
    op.create_index("ix_submissions_status_created", "submissions", ["status", "created_at"])
    op.create_index("ix_essay_versions_essay_created", "essay_versions", ["essay_id", "created_at"])

    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute(
        "CREATE INDEX ix_essays_title_trgm ON essays USING gin (title gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX ix_essays_abstract_trgm ON essays USING gin (abstract gin_trgm_ops)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_essays_abstract_trgm")
    op.execute("DROP INDEX IF EXISTS ix_essays_title_trgm")
    op.drop_index("ix_essay_versions_essay_created", table_name="essay_versions")
    op.drop_index("ix_submissions_status_created", table_name="submissions")
    op.drop_index("ix_notifications_user_read", table_name="notifications")
    op.drop_index("ix_reading_history_user_last", table_name="reading_history")
    op.drop_index("ix_essays_series_id", table_name="essays")
    op.drop_index("ix_essays_status_publication", table_name="essays")
    op.drop_index("uq_essays_single_current", table_name="essays")
    op.drop_constraint("ck_submissions_status", "submissions", type_="check")
    op.drop_constraint("ck_essays_reading_time_positive", "essays", type_="check")
    op.drop_constraint("ck_essays_status", "essays", type_="check")
    op.drop_constraint("ck_reading_history_progress", "reading_history", type_="check")
    op.drop_constraint(
        "uq_reading_history_user_essay", "reading_history", type_="unique"
    )
    op.drop_constraint("uq_essay_themes_essay_theme", "essay_themes", type_="unique")
    op.drop_column("submissions", "reviewed_at")
    op.drop_column("submissions", "reviewer_notes")
    op.drop_column("essays", "view_count")
    op.drop_index("ix_feedback_status_created", table_name="feedback")
    op.drop_index("ix_feedback_id", table_name="feedback")
    op.drop_table("feedback")
    op.drop_index("ix_bookmarks_user_created", table_name="bookmarks")
    op.drop_index("ix_bookmarks_id", table_name="bookmarks")
    op.drop_table("bookmarks")
    op.drop_index("ix_comments_essay_approved", table_name="comments")
    op.drop_index("ix_comments_id", table_name="comments")
    op.drop_table("comments")
