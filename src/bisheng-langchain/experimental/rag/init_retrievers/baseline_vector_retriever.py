import os
import uuid
from typing import Any, Dict, Iterable, List, Optional

from bisheng_langchain.vectorstores.milvus import Milvus
from langchain_core.documents import Document
from langchain_core.pydantic_v1 import Field
from langchain_core.retrievers import BaseRetriever
from langchain_core.vectorstores import VectorStore
from utils import import_by_type

from langchain.callbacks.manager import CallbackManagerForRetrieverRun
from langchain.text_splitter import TextSplitter


class BaselineVectorRetriever(BaseRetriever):
    vector_store: Milvus
    text_splitter: TextSplitter
    search_type: str = 'similarity'
    search_kwargs: dict = Field(default_factory=dict)

    def add_documents(
        self,
        documents: List[Document],
        collection_name: str,
        drop_old: bool = False,
    ) -> None:
        split_docs = self.text_splitter.split_documents(documents)
        print(f"BaselineVectorRetriever: split document into {len(split_docs)} chunks")
        for chunk_index, split_doc in enumerate(split_docs):
            if 'chunk_bboxes' in split_doc.metadata:
                split_doc.metadata.pop('chunk_bboxes')
            split_doc.metadata['chunk_index'] = chunk_index

        connection_args = self.vector_store.connection_args
        embedding_function = self.vector_store.embedding_func
        self.vector_store.from_documents(
            split_docs,
            embedding=embedding_function,
            collection_name=collection_name,
            connection_args=connection_args,
            drop_old=drop_old,
        )

    def _get_relevant_documents(
        self,
        query: str,
        collection_name: str,
    ) -> List[Document]:
        self.vector_store = self.vector_store.__class__(
            collection_name=collection_name,
            embedding_function=self.vector_store.embedding_func,
            connection_args=self.vector_store.connection_args,
        )
        if self.search_type == 'similarity':
            result = self.vector_store.similarity_search(query, **self.search_kwargs)
        return result
