<script>
  import layer from 'vuelayers/src/mixins/layer'
  // todo подумать, может достаточно слои и сорсы хранить просто в файле *.vue, не мутить такую вложенность
  export default {
    name: 'vl-vector-layer',
    mixins: [ layer ]
  }
</script>
