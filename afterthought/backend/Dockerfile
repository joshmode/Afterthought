FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN addgroup --system afterthought \
    && adduser --system --ingroup afterthought afterthought

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=afterthought:afterthought . .
RUN sed -i 's/\r$//' start.sh && chmod +x start.sh

USER afterthought

EXPOSE 8000
CMD ["./start.sh"]
