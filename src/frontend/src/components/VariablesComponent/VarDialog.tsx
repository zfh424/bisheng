import _ from 'lodash';
import { ArrowDownUp, Plus, X } from "lucide-react";
import { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { generateUUID } from '../../utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function VarDialog({ data, onSave, onClose }) {

    const [item, setItem] = useState(data)
    const { t } = useTranslation()

    const handleSave = () => {
        // 处理保存逻辑
        onSave({ ...item });
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const newOptions = Array.from(item.options);
        const [movedOption] = newOptions.splice(result.source.index, 1);
        newOptions.splice(result.destination.index, 0, movedOption);

        setItem({ ...item, options: newOptions });
    };

    const handleChangeOptionValue = (value, index) => {
        const updatedItem = { ...item };
        updatedItem.options[index].value = value;
        setItem(updatedItem)
    }

    const VariablesName = <div>
        <label className='text-sm text-gray-500'>{t('flow.variableName')}：</label>
        <Input value={item.name} className='mt-2' onChange={(e) => setItem(prevItem => ({
            ...prevItem,
            name: e.target.value
        }))} />
    </div>

    return (
        <dialog className="modal bg-blur-shared modal-open">
            <div className="w-[360px] bg-[#fff] rounded-xl p-8 shadow-lg">
                <Tabs defaultValue={item.type}
                    className="w-full"
                    onValueChange={(t) => setItem(prevItem => ({
                        ...prevItem,
                        type: t
                    }))} >
                    <TabsList className="">
                        <TabsTrigger value="text" className="roundedrounded-xl">{t('flow.text')}</TabsTrigger>
                        <TabsTrigger value="select">{t('flow.dropdown')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text">
                        {VariablesName}
                        <div>
                            <label className='text-sm text-gray-500'>{t('flow.max_length')}：</label>
                            <Input value={item.maxLength} className='mt-2' onChange={(e) => setItem(prevItem => ({
                                ...prevItem,
                                maxLength: e.target.value
                            }))} />
                        </div>
                    </TabsContent>
                    <TabsContent value="select" className='pb-10'>
                        {VariablesName}
                        <label className='text-sm text-gray-500'>{t('flow.options')}：</label>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="list" direction="vertical" >
                                {(provide) => (
                                    <div  {...provide.droppableProps} ref={provide.innerRef}>
                                        {item.options.map((option, index) =>
                                            <Draggable key={'li' + option.key} draggableId={'li' + option.key} index={index}>
                                                {(provided, snapshot) => (
                                                    <div className='flex mt-2 gap-2 select-none'
                                                        ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                        style={{
                                                            // backgroundColor: snapshot.isDragging,
                                                            ...provided.draggableProps.style
                                                        }}>
                                                        <Input value={option.value} onChange={(e) => handleChangeOptionValue(e.target.value, index)} />
                                                        <button onClick={() => {
                                                            setItem((old) => {
                                                                let newItem = _.cloneDeep(old);
                                                                newItem.options.splice(index, 1);
                                                                return newItem;
                                                            });
                                                        }}>
                                                            <X className={"h-4 w-4 hover:text-accent-foreground"} />
                                                        </button>
                                                        <button>
                                                            <ArrowDownUp className={"h-4 w-4 hover:text-accent-foreground"} />
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        )}
                                        {provide.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        <button onClick={() =>
                            setItem(prevItem => ({
                                ...prevItem,
                                options: [...prevItem.options, { key: generateUUID(4), value: "" }]
                            }))
                        }>
                            <Plus className={"h-4 w-4 mt-2 hover:text-accent-foreground"} />
                        </button>
                    </TabsContent>
                </Tabs>
                <div className='flex mt-4 justify-end gap-4'>
                    <Button variant='outline' size='sm' onClick={onClose}>{t('cancel')}</Button>
                    <Button onClick={handleSave} size='sm'>{t('save')}</Button>
                </div>
            </div>
        </dialog>
    );
};