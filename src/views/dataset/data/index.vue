<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="名称" prop="itemName">
        <el-input
          v-model="queryParams.itemName"
          placeholder="请输入图片/视频名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否标注" prop="isNotation">
        <el-select v-model="queryParams.isNotation" placeholder="请选择是否标注" clearable>
          <el-option
            v-for="dict in dict.type.notation_yes_no"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['dataset:data:add']"
        >导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['dataset:data:edit']"
        >标注</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['dataset:data:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['dataset:data:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-check"
          size="mini"
          @click="handleFinish"
        >结束标注</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="名称" align="center" prop="itemName" />
      <el-table-column label="是否标注" align="center" prop="isNotation">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.notation_yes_no" :value="scope.row.isNotation"/>
        </template>
      </el-table-column>
      <el-table-column label="标注标签" align="center" prop="notation" />
      <el-table-column label="图片/视频" min-width="250px" align="center" prop="item">
        <template slot-scope="scope">
          <img :src="getImageUrl(scope.row.item)" alt="null">
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['dataset:data:edit']"
          >标注</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['dataset:data:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 导入对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="图片" prop="item">
          <el-upload
            class="upload-demo"
            action="#"
            multiple
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-change="handleBeforeUpload"
            :file-list="fileList"
            :auto-upload="false"
            list-type="picture">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="upload">确 定</el-button>
        <el-button @click="cancelUpload">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 标注对话框 -->
    <el-dialog :title="title" :visible.sync="notation_open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标签" prop="notation">
          <el-input v-model="form.notation" placeholder="请输入标签名" />
        </el-form-item>
        <el-form-item label="图片">
          <img :src="getImageUrl_read_only(this.item_read_only)" alt="null">
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listData, getData, delData, addData, updateData, uploadData } from "@/api/dataset/data";
import { saveAs } from 'file-saver'

export default {
  name: "Data",
  dicts: ['notation_yes_no'],
  data() {
    return {
      // 遮罩层
      loading: true,
      item_read_only: "",
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 数据标注表格数据
      dataList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      //是否显示标注层
      notation_open:false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        itemName: null,
        isNotation: null,
      },
      // 表单参数
      form: {},
      // 待上传文件列表
      fileList: [],

      // 表单校验
      rules: {
        itemName: [
          { required: true, message: "图片/视频名不能为空", trigger: "blur" }
        ],

      }
    };
  },
  created() {
    this.getList();
  },
  mounted() {
    this.$watch('$route', this.handleRouteChange);
  },
  methods: {
    handleRouteChange(){
      // 执行页面刷新操作
      location.reload();
    },
    /** 查询数据标注列表 */
    getList() {
      console.log(this.$route.query.dataset_id);
      if(this.$route.query.dataset_id !== undefined){
        this.queryParams["sysDatasetData.datasetId"]=this.$route.query.dataset_id;
        console.log(this.queryParams);
      }
      this.loading = true;
      listData(this.queryParams).then(response => {
        this.dataList = response.rows;
        this.total = response.total;
        this.loading = false;
        console.log(this.dataList);
      });
    },
    getImageUrl(item){
      if(item !== null){
        let img = 'data:image/png;base64,' + item
        return img
      }
    },
    getImageUrl_read_only(item){
      if(item !== null){
        let img = 'data:image/png;base64,' + item
        return img
      }
    },
    // 取消按钮
    cancel() {
      this.notation_open = false;
      this.reset();
    },
    // 取消上传按钮
    cancelUpload() {
      this.fileList=[];
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        dataId: null,
        itemName: null,
        isNotation: null,
        notation: null,
        item: null,
        sysDatasetData: {
          datasetId:this.$route.query.dataset_id
        },
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 移除待上传图片 **/
    handleRemove(file, fileList) {
      this.fileList = fileList
      console.log(file, fileList);
    },
    handleBeforeUpload(file, fileList) {
      console.log(file, fileList);
      this.fileList = fileList
    },
    /** 预览待上传图片 **/
    handlePreview(file) {
      console.log(file);
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.dataId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.fileList = [];
      this.open = true;
      this.title = "导入数据";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      console.log(row);
      this.item_read_only = row.item;
      this.reset();
      const dataId = row.dataId || this.ids
      getData(dataId).then(response => {
        this.form = response.data;
        this.notation_open = true;
        // this.open = true;
        this.title = "标注数据";
      });
    },
    /** 上传图片 **/
    upload(){
      console.log("upload");
      let forms = []
      this.fileList.forEach( file =>{
        if(file.name !=null&&file.name !==''){
          let formData = new FormData();
          formData.append('file', file.raw);
          formData.append('dataset_id', this.$route.query.dataset_id);
          // formData.append('item', file.raw);
          // let t_form={}
          // t_form.itemName = file.name;
          // t_form.item = file.raw;
          forms.push(formData)
        }
      })
      console.log("forms", forms);
      if(forms.length===0){
        this.$modal.msg("无文件上传");
      }
      else {
        forms.forEach(form => {
          console.log("submit", form)
          uploadData(form).then(response => {
            this.$modal.msgSuccess("导入成功");
            this.open = false;
            this.getList();
            console.log(response);
            // 重置fileList
            this.fileList = [];
          })
        })
      }

    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.dataId != null) {
            console.log(this.form)
            if(this.form.notation != null && this.form.notation !== ""){
              this.form.isNotation=1;
            }
            else {
              this.form.isNotation=0;
            }
            updateData(this.form).then(response => {
              console.log('after', this.form)
              this.$modal.msgSuccess("标注成功");
              // this.open = false;
              this.notation_open = false;
              this.getList();
            });
          } else {
            addData(this.form).then(response => {
              this.$modal.msgSuccess("导入成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const dataIds = row.dataId || this.ids;

      let dataIdsWithDatasetId = []
      if(Array.isArray(dataIds)){
        dataIdsWithDatasetId = dataIds.concat(this.$route.query.dataset_id);
      }
      else{
        dataIdsWithDatasetId = [dataIds, this.$route.query.dataset_id]
      }
      console.log(dataIdsWithDatasetId);
      this.$modal.confirm('是否确认删除数据标注编号为"' + dataIds + '"的数据项？').then(function() {
        return delData(dataIdsWithDatasetId);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    handleFinish(){
      let that = this;
      this.$modal.confirm('是否确认结束本次标注').then(function() {
        that.$router.push('/dataset')
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('dataset/data/export', {
        ...this.queryParams
      }, `data_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
