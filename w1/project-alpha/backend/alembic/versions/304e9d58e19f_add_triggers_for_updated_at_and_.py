"""add triggers for updated_at and completed_at

Revision ID: 304e9d58e19f
Revises: 03d3b68cc05c
Create Date: 2025-11-09 17:18:44.399025

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "304e9d58e19f"
down_revision: Union[str, Sequence[str], None] = "03d3b68cc05c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 创建 updated_at 触发器函数
    op.execute(
        """
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """
    )

    op.execute(
        """
        CREATE TRIGGER update_tickets_updated_at
            BEFORE UPDATE ON tickets
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    """
    )

    # 创建 completed_at 触发器函数（使用大写的枚举值）
    op.execute(
        """
        CREATE OR REPLACE FUNCTION set_completed_at()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.status::text = 'COMPLETED' AND (OLD.status::text IS NULL OR OLD.status::text != 'COMPLETED') THEN
                NEW.completed_at = CURRENT_TIMESTAMP;
            ELSIF NEW.status::text = 'PENDING' AND OLD.status::text = 'COMPLETED' THEN
                NEW.completed_at = NULL;
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """
    )

    op.execute(
        """
        CREATE TRIGGER trigger_set_completed_at
            BEFORE UPDATE ON tickets
            FOR EACH ROW
            EXECUTE FUNCTION set_completed_at();
    """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP TRIGGER IF EXISTS trigger_set_completed_at ON tickets;")
    op.execute("DROP FUNCTION IF EXISTS set_completed_at();")
    op.execute("DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column();")
